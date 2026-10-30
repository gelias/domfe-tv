const { createHash, randomUUID } = require('node:crypto');
const { createReadStream } = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');

function validateManifest(manifest) {
  if (manifest.version !== 1 || !Array.isArray(manifest.files) || !manifest.files.length) {
    throw new Error('Manifesto de mídias inválido.');
  }
  const paths = new Set();
  for (const file of manifest.files) {
    if (!/^assets\/(audio|video)\/[a-z0-9-]+\.(mp3|mp4)$/.test(file.path) ||
        !/^[a-zA-Z0-9_-]+$/.test(file.fileId) || !/^[a-f0-9]{64}$/.test(file.sha256) ||
        !Number.isSafeInteger(file.bytes) || file.bytes <= 0 || paths.has(file.path)) {
      throw new Error('Entrada inválida no manifesto de mídias.');
    }
    paths.add(file.path);
  }
  return manifest.files;
}

async function isValid(filePath, file) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile() || stat.size !== file.bytes) return false;
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(filePath)) hash.update(chunk);
    return hash.digest('hex') === file.sha256;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function chooseMediaRoot(preferred, fallback) {
  for (const root of [...new Set([preferred, fallback])]) {
    const probe = path.join(root, 'assets', `.domfe-write-${randomUUID()}`);
    try {
      await fs.mkdir(path.dirname(probe), { recursive: true });
      await fs.writeFile(probe, '', { flag: 'wx' });
      await fs.unlink(probe);
      return root;
    } catch {
      // Pastas de instalação podem ser somente leitura; usar dados do usuário.
    }
  }
  throw new Error('Não foi possível salvar as mídias. Escolha uma pasta com permissão de escrita.');
}

function trustedDownload(url) {
  const parsed = new URL(url);
  return parsed.protocol === 'https:' && !parsed.username && !parsed.password &&
    (!parsed.port || parsed.port === '443') &&
    ['drive.google.com', 'drive.usercontent.google.com'].includes(parsed.hostname);
}

async function requestDownload(url, signal, request) {
  for (let redirects = 0; redirects < 8; redirects += 1) {
    if (!trustedDownload(url)) throw new Error('Endereço de download não autorizado.');
    const response = await request(url, { signal, redirect: 'manual' });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('Redirecionamento de download inválido.');
      url = new URL(location, url).href;
      continue;
    }
    if (!response.ok) throw new Error(`O servidor de mídias respondeu com erro ${response.status}.`);
    return response;
  }
  throw new Error('O servidor redirecionou o download muitas vezes.');
}

async function readConfirmation(response) {
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 65536) throw new Error('O Google Drive não disponibilizou o arquivo para download.');
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function confirmationURL(html, fileId) {
  const form = html.match(/<form\b[^>]*id="download-form"[^>]*>[\s\S]*?<\/form>/i)?.[0];
  if (!form) throw new Error('O Google Drive não disponibilizou o arquivo. Verifique o compartilhamento e tente novamente.');
  const url = new URL('https://drive.usercontent.google.com/download');
  for (const input of form.matchAll(/<input\b[^>]*>/gi)) {
    const name = input[0].match(/\bname="([^"]+)"/i)?.[1];
    const value = input[0].match(/\bvalue="([^"]*)"/i)?.[1];
    if (['id', 'export', 'confirm', 'uuid'].includes(name) && value !== undefined) {
      url.searchParams.set(name, value.replaceAll('&amp;', '&'));
    }
  }
  if (url.searchParams.get('id') !== fileId || !url.searchParams.has('confirm')) {
    throw new Error('Confirmação de download inválida.');
  }
  return url.href;
}

async function downloadFile(root, file, onProgress, { signal, request = fetch, idleMs = 60000 } = {}) {
  const destination = path.join(root, file.path);
  const temporary = `${destination}.part`;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const controller = new AbortController();
  const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
  let timer;
  const touch = () => {
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(new Error('Download sem resposta. Verifique a conexão e tente novamente.')), idleMs);
  };
  let handle;
  try {
    touch();
    let response = await requestDownload(`https://drive.google.com/uc?export=download&id=${file.fileId}`, combined, request);
    if ((response.headers.get('content-type') || '').includes('text/html')) {
      const url = confirmationURL(await readConfirmation(response), file.fileId);
      touch();
      response = await requestDownload(url, combined, request);
    }
    if ((response.headers.get('content-type') || '').includes('text/html') || !response.body) {
      await response.body?.cancel();
      throw new Error('O Google Drive enviou uma página em vez da mídia. Tente novamente mais tarde.');
    }
    const hash = createHash('sha256');
    let received = 0;
    handle = await fs.open(temporary, 'w');
    for await (const chunk of response.body) {
      combined.throwIfAborted();
      touch();
      received += chunk.length;
      if (received > file.bytes) throw new Error('O tamanho da mídia não corresponde ao esperado.');
      hash.update(chunk);
      await handle.writeFile(chunk);
      onProgress(received);
    }
    if (received !== file.bytes || hash.digest('hex') !== file.sha256) {
      throw new Error('A mídia recebida está incompleta ou foi alterada. Tente novamente.');
    }
    await handle.close();
    handle = null;
    await fs.rename(temporary, destination);
  } finally {
    clearTimeout(timer);
    controller.abort();
    await handle?.close();
    await fs.rm(temporary, { force: true });
  }
}

async function prepareMedia(root, manifest, report, options = {}) {
  const files = validateManifest(manifest);
  const totalBytes = files.reduce((total, file) => total + file.bytes, 0);
  let completed = 0;
  for (const file of files) {
    options.signal?.throwIfAborted();
    report({ phase: 'checking', label: file.label, received: completed, totalBytes });
    if (!await isValid(path.join(root, file.path), file)) {
      report({ phase: 'downloading', label: file.label, received: completed, totalBytes });
      await downloadFile(root, file, received => {
        report({ phase: 'downloading', label: file.label, received: completed + received, totalBytes });
      }, options);
    }
    completed += file.bytes;
  }
  report({ phase: 'ready', received: totalBytes, totalBytes });
}

module.exports = { validateManifest, isValid, chooseMediaRoot, confirmationURL, downloadFile, prepareMedia };
