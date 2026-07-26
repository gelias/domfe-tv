import assert from 'node:assert/strict';
import test from 'node:test';
import { PlaylistEngine } from '../src/core/playlist-engine.js';

class FakeScheduler {
  constructor() { this.jobs = new Map(); this.id = 0; }
  setTimeout(callback, ms) { const id = ++this.id; this.jobs.set(id, { callback, ms }); return id; }
  clearTimeout(id) { this.jobs.delete(id); }
  runNext() {
    const entry = this.jobs.entries().next().value;
    if (!entry) return false;
    const [id, job] = entry;
    this.jobs.delete(id);
    job.callback();
    return true;
  }
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('percorre dois loops completos na ordem correta', async () => {
  const scheduler = new FakeScheduler();
  const visited = [];
  let finishVideo;
  const playlist = [
    { type: 'welcome', duration: 1 },
    { type: 'video', src: 'video.mp4' },
    { type: 'closing', duration: 1 }
  ];
  const engine = new PlaylistEngine({
    playlist,
    settings: { loop: true, defaultDuration: 1 },
    scheduler,
    activate: async (item, index, { complete }) => {
      visited.push(index);
      if (item.type === 'video') finishVideo = complete;
      return { dispose() {} };
    }
  });

  await engine.start();
  for (let cycle = 0; cycle < 2; cycle += 1) {
    assert.equal(scheduler.runNext(), true);
    await settle();
    assert.equal(scheduler.jobs.size, 0, 'vídeo não pode receber timer');
    finishVideo();
    await settle();
    assert.equal(scheduler.runNext(), true);
    await settle();
  }
  assert.deepEqual(visited.slice(0, 7), [0, 1, 2, 0, 1, 2, 0]);
  await engine.destroy();
});

test('vídeo avança por ended/erro e nunca por temporizador', async () => {
  const scheduler = new FakeScheduler();
  let completeVideo;
  const engine = new PlaylistEngine({
    playlist: [{ type: 'video', src: 'local.mp4' }, { type: 'closing', duration: 2 }],
    settings: { loop: true, defaultDuration: 3 },
    scheduler,
    activate: async (item, _index, { complete }) => {
      if (item.type === 'video') completeVideo = complete;
      return { dispose() {} };
    }
  });
  await engine.start();
  assert.equal(scheduler.jobs.size, 0);
  completeVideo();
  await settle();
  assert.equal(engine.index, 1);
  assert.equal(scheduler.jobs.size, 1);
  await engine.destroy();
});

test('loop false encerra depois da última cena', async () => {
  const scheduler = new FakeScheduler();
  const engine = new PlaylistEngine({
    playlist: [{ type: 'closing', duration: 1 }],
    settings: { loop: false, defaultDuration: 1 },
    scheduler,
    activate: async () => ({ dispose() {} })
  });
  await engine.start();
  scheduler.runNext();
  await settle();
  assert.equal(engine.index, 0);
  assert.equal(scheduler.jobs.size, 0);
});
