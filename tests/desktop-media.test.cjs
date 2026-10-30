const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { chooseMediaRoot, prepareMedia, validateManifest, downloadFile, isValid } = require('../desktop/media.cjs');
const { createContentHandler, parseRange } = require('../desktop/content.cjs');

const bytes = Buffer.from('media fixture for offline playback');
const file = { path: 'assets/video/test.mp4', label: 'Vídeo', fileId: 'drive-id', bytes: bytes.length,
  sha256: createHash('sha256').update(bytes).digest('hex') };
const manifest = { version: 1, files: [file] };
async function directory(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'domfe-media-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}
const binary = () => new Response(bytes, { headers: { 'content-type': 'video/mp4' } });

test('first run handles Drive confirmation and then works with no network', async t => {
  const root = await directory(t);
  const progress = [];
  let requests = 0;
  const request = async url => {
    requests += 1;
    if (requests === 1) {
      assert.match(url, /drive.google.com\/uc/);
      return new Response('<form id="download-form"><input name="id" value="drive-id"><input name="confirm" value="t"><input name="uuid" value="abc"></form>',
        { headers: { 'content-type': 'text/html' } });
    }
    assert.equal(new URL(url).hostname, 'drive.usercontent.google.com');
    assert.equal(new URL(url).searchParams.get('confirm'), 't');
    return binary();
  };
  await prepareMedia(root, manifest, update => progress.push(update), { request });
  assert.equal(requests, 2);
  assert.equal(progress.at(-1).phase, 'ready');
  assert.equal(await isValid(path.join(root, file.path), file), true);
  await prepareMedia(root, manifest, () => {}, { request: () => { throw new Error('Offline'); } });
});

test('bad checksum never replaces an existing file; retry repairs it', async t => {
  const root = await directory(t);
  const destination = path.join(root, file.path);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, Buffer.alloc(bytes.length, 0));
  await assert.rejects(prepareMedia(root, manifest, () => {}, {
    request: async () => new Response(Buffer.alloc(bytes.length, 1))
  }), /alterada/);
  assert.deepEqual(await fs.readFile(destination), Buffer.alloc(bytes.length, 0));
  await assert.rejects(fs.stat(`${destination}.part`), { code: 'ENOENT' });
  await prepareMedia(root, manifest, () => {}, { request: async () => binary() });
  assert.deepEqual(await fs.readFile(destination), bytes);
});

test('partial, oversized and HTML responses are rejected and cleaned up', async t => {
  const root = await directory(t);
  for (const request of [
    async () => new Response(bytes.subarray(0, 4)),
    async () => new Response(Buffer.concat([bytes, bytes])),
    async () => new Response('<h1>Quota exceeded</h1>', { headers: { 'content-type': 'text/html' } })
  ]) {
    await assert.rejects(downloadFile(root, file, () => {}, { request }));
    await assert.rejects(fs.stat(path.join(root, file.path)), { code: 'ENOENT' });
    await assert.rejects(fs.stat(path.join(root, `${file.path}.part`)), { code: 'ENOENT' });
  }
});

test('failed or cancelled requests do not leave media ready for playback', async t => {
  const root = await directory(t);
  for (const request of [
    async () => new Response(null, { status: 403 }),
    async () => { throw new Error('Network disconnected'); },
    async (_url, { signal }) => { signal.throwIfAborted(); }
  ]) {
    await assert.rejects(downloadFile(root, file, () => {}, {
      request, signal: AbortSignal.abort(new Error('Cancelled'))
    }));
    await assert.rejects(fs.stat(path.join(root, `${file.path}.part`)), { code: 'ENOENT' });
  }
});

test('redirects cannot leave approved Google download hosts', async t => {
  const root = await directory(t);
  let calls = 0;
  await assert.rejects(downloadFile(root, file, () => {}, { request: async () => {
    calls += 1;
    return new Response(null, { status: 302, headers: { location: 'https://example.com/file' } });
  } }), /não autorizado/);
  assert.equal(calls, 1);
});

test('read-only/unavailable portable directory falls back to user data', async t => {
  const root = await directory(t);
  const unavailable = path.join(root, 'not-a-directory');
  await fs.writeFile(unavailable, 'file');
  const fallback = path.join(root, 'user-data');
  assert.equal(await chooseMediaRoot(unavailable, fallback), fallback);
  assert.deepEqual(await fs.readdir(path.join(fallback, 'assets')), []);
});

test('manifest rejects traversal and duplicate paths', () => {
  assert.throws(() => validateManifest({ ...manifest, files: [{ ...file, path: '../bad.mp4' }] }));
  assert.throws(() => validateManifest({ ...manifest, files: [file, file] }));
});

test('desktop serves downloaded video ranges and keeps internal code private', async t => {
  const root = await directory(t);
  await downloadFile(root, file, () => {}, { request: async () => binary() });
  const handler = createContentHandler(process.cwd(), root, manifest);
  const response = await handler(new Request(`domfe://app/${file.path}`, { headers: { Range: 'bytes=2-7' } }));
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('content-range'), `bytes 2-7/${bytes.length}`);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes.subarray(2, 8));
  const head = await handler(new Request(`domfe://app/${file.path}`, { method: 'HEAD' }));
  assert.equal(head.headers.get('content-length'), String(bytes.length));
  assert.equal(await head.text(), '');
  assert.equal((await handler(new Request(`domfe://app/${file.path}`, { headers: { Range: 'bytes=99999-' } }))).status, 416);
  assert.equal((await handler(new Request('domfe://app/desktop/main.cjs'))).status, 404);
  assert.equal((await handler(new Request('domfe://app/src/..%2fdesktop/main.cjs'))).status, 403);
  assert.equal((await handler(new Request('domfe://other/index.html'))).status, 403);
  const index = await handler(new Request('domfe://app/index.html'));
  assert.equal(index.status, 200);
  assert.match(index.headers.get('content-security-policy'), /script-src 'self'/);
  await index.body.cancel();
  const agenda = await (await handler(new Request('domfe://app/api/agenda'))).json();
  assert.equal(agenda.files[0], 'content/agenda/mes.png');
});

test('video range parsing handles suffixes and rejects malformed requests', () => {
  assert.deepEqual(parseRange('bytes=-4', 10), { start: 6, end: 9 });
  assert.deepEqual(parseRange('bytes=3-', 10), { start: 3, end: 9 });
  assert.deepEqual(parseRange('bytes=0-999', 10), { start: 0, end: 9 });
  for (const range of ['bytes=-0', 'bytes=8-2', 'bytes=1-2,4-5', 'bytes=-', 'garbage']) {
    assert.equal(parseRange(range, 10), null);
  }
});

test('production manifest matches recovery links and configured media', async () => {
  const production = require('../config/media-manifest.json');
  const settings = require('../config/settings.json');
  const playlist = require('../config/playlist.json');
  validateManifest(production);
  assert.ok(production.files.some(item => item.path === settings.music.src));
  for (const scene of playlist.filter(item => item.type === 'video')) {
    assert.ok(production.files.some(item => item.path === scene.src));
  }
  for (const item of production.files) {
    const link = await fs.readFile(path.join(path.dirname(item.path), 'download.txt'), 'utf8');
    assert.ok(link.includes(`/d/${item.fileId}/`));
  }
});
