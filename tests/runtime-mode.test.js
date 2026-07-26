import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareRuntimeMode } from '../src/core/runtime-mode.js';

const settings = { music: { src: 'assets/audio/instrumental.mp3', volume: 0.2 } };
const playlist = [
  { type: 'welcome', title: 'Início' },
  { type: 'video', title: 'Evangelho no Lar', src: 'assets/video/evangelho-no-lar.mp4' },
  { type: 'socials', title: 'Redes sociais' }
];

test('GitHub Pages não carrega mídia pesada e preserva o fluxo da programação', () => {
  const prepared = prepareRuntimeMode(settings, playlist, 'gelias.github.io');
  assert.equal(prepared.settings.music.src, '');
  assert.equal(prepared.playlist[1].type, 'closing');
  assert.match(prepared.playlist[1].title, /Vídeo indisponível/i);
  assert.equal(prepared.playlist[2].type, 'socials');
});

test('execução local mantém música e vídeo originais', () => {
  const prepared = prepareRuntimeMode(settings, playlist, '127.0.0.1');
  assert.equal(prepared.settings.music.src, 'assets/audio/instrumental.mp3');
  assert.equal(prepared.playlist[1].type, 'video');
  assert.equal(prepared.playlist[1].src, 'assets/video/evangelho-no-lar.mp4');
});
