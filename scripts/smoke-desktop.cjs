// Run the packaged app on a native desktop runner and verify its local protocol,
// isolated preload bridge, images and bundled playlist. Media playback is a
// separate check on the destination computer; downloads need not finish here.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const net = require('node:net');
const { setTimeout: delay } = require('node:timers/promises');

async function main() {
  assert.ok(process.argv[2], 'Pass the packaged executable path');
  const port = await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
  const child = spawn(path.resolve(process.argv[2]), [`--remote-debugging-port=${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', chunk => { output = (output + chunk).slice(-16000); });
  child.stderr.on('data', chunk => { output = (output + chunk).slice(-16000); });
  let spawnError;
  child.on('error', error => { spawnError = error; });
  let socket;
  try {
    let target;
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null || child.signalCode) throw new Error(`App exited early: ${output}`);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(2000) });
        target = (await response.json()).find(page => page.type === 'page' && page.url.startsWith('domfe://app/'));
        if (target) break;
      } catch {}
      await delay(500);
    }
    assert.ok(target, `App window did not load: ${output}`);
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    let id = 0;
    const evaluate = expression => new Promise((resolve, reject) => {
      const requestId = ++id;
      const timer = setTimeout(() => { socket.removeEventListener('message', receive); reject(new Error('Renderer timed out')); }, 15000);
      function receive(event) {
        const message = JSON.parse(event.data);
        if (message.id !== requestId) return;
        clearTimeout(timer);
        socket.removeEventListener('message', receive);
        if (message.error || message.result.exceptionDetails) reject(new Error(JSON.stringify(message)));
        else resolve(message.result.result.value);
      }
      socket.addEventListener('message', receive);
      socket.send(JSON.stringify({ id: requestId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    });
    let result;
    for (let attempt = 0; attempt < 30; attempt++) {
      result = await evaluate(`(async () => {
        if (location.href !== 'domfe://app/index.html' || document.readyState !== 'complete') {
          return { ready: false };
        }
        const playlist = await (await fetch('domfe://app/config/playlist.json')).json();
        const weeks = playlist.filter(item => item.type === 'agenda' && item.entries);
        return {
          ready: true,
          title: document.title,
          button: !!document.querySelector('#startButton'),
          bridge: typeof window.domfeDesktop?.prepareMedia,
          logo: [...document.querySelectorAll('#startOverlay img')].every(image => image.complete && image.naturalWidth > 0),
          weeks: weeks.length,
          entries: weeks.reduce((total, week) => total + week.entries.length, 0),
          months: weeks.map(week => week.month)
        };
      })()`);
      if (result.button && result.logo && result.bridge === 'function') break;
      await delay(500);
    }
    assert.equal(result.ready, true, 'Packaged document did not finish loading');
    assert.equal(result.title, 'Domfe TV');
    assert.equal(result.button, true);
    assert.equal(result.bridge, 'function');
    assert.equal(result.logo, true);
    assert.equal(result.weeks, 5);
    assert.ok(result.entries > 0);
    assert.ok(result.months.every(month => typeof month === 'string' && month.length > 0));
    console.log('Packaged desktop smoke test passed:', JSON.stringify(result));
  } finally {
    socket?.close();
    if (child.exitCode === null && !child.signalCode) {
      child.kill('SIGTERM');
      await Promise.race([new Promise(resolve => child.once('exit', resolve)), delay(5000)]);
      if (child.exitCode === null && !child.signalCode) child.kill('SIGKILL');
    }
  }
}
main().catch(error => {
  const message = String(error.stack || error).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
  console.error(`::error title=Desktop smoke test::${message}`);
  process.exitCode = 1;
});
