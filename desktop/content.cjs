const { createReadStream } = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Readable } = require('node:stream');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4'
};
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'";

function parseRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value || '');
  if (!match || (!match[1] && !match[2]) || size === 0) return null;
  const suffix = !match[1];
  const start = suffix ? Math.max(0, size - Number(match[2])) : Number(match[1]);
  const end = suffix || !match[2] ? size - 1 : Math.min(size - 1, Number(match[2]));
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return null;
  return { start, end };
}

async function agendaFiles(root) {
  const names = await fs.readdir(path.join(root, 'content/agenda'));
  return names.filter(name => /^(mes|semana[1-9][0-9]*)\.png$/i.test(name))
    .sort((a, b) => {
      const order = name => /^mes\./i.test(name) ? 0 : Number(name.match(/\d+/)[0]);
      return order(a) - order(b);
    }).map(name => `content/agenda/${name}`);
}

function createContentHandler(appRoot, mediaRoot, manifest) {
  const mediaPaths = new Set(manifest.files.map(file => file.path));
  return async request => {
    try {
      const url = new URL(request.url);
      if (url.protocol !== 'domfe:' || url.host !== 'app') return new Response(null, { status: 403 });
      if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405 });
      const pathname = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
      if (pathname.split('/').some(segment => segment === '..' || segment === '.') || pathname.includes('\\') || pathname.includes('\0')) {
        return new Response(null, { status: 403 });
      }
      if (pathname === 'api/agenda') {
        return Response.json({ files: await agendaFiles(appRoot) });
      }
      if (!/^(index\.html|styles\.css|(?:src|assets\/images|config|content)\/[^\\\0]+)$/.test(pathname) && !mediaPaths.has(pathname)) {
        return new Response(null, { status: 404 });
      }
      const root = mediaPaths.has(pathname) ? mediaRoot : appRoot;
      const filePath = path.resolve(root, pathname);
      if (!filePath.startsWith(`${path.resolve(root)}${path.sep}`)) return new Response(null, { status: 403 });
      // Only the local assets listed above are exposed; desktop code stays private.
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) return new Response(null, { status: 404 });
      const headers = {
        'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream',
        'Content-Security-Policy': CSP,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes'
      };
      const rangeValue = request.headers.get('range');
      const range = rangeValue ? parseRange(rangeValue, stat.size) : null;
      if (rangeValue && !range) {
        return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${stat.size}` } });
      }
      const start = range?.start ?? 0;
      const end = range?.end ?? stat.size - 1;
      headers['Content-Length'] = String(Math.max(0, end - start + 1));
      if (range) headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      const body = request.method === 'HEAD' || !stat.size ? null : Readable.toWeb(createReadStream(filePath, { start, end }));
      return new Response(body, { status: range ? 206 : 200, headers });
    } catch (error) {
      return new Response(null, { status: error.code === 'ENOENT' ? 404 : 500 });
    }
  };
}

module.exports = { parseRange, agendaFiles, createContentHandler };
