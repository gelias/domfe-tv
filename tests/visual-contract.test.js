import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('contrato visual Full HD preserva tamanhos mínimos', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.scene-title[^}]*clamp\(72px,/s);
  assert.match(css, /\.quote-title[^}]*color:\s*var\(--blue-dark\)/s);
  assert.match(css, /\.scene-weekly[^}]*align-items:\s*flex-start/s);
  assert.match(css, /\.weekly-highlight-qr-only[^}]*justify-content:\s*end/s);
  assert.match(css, /\.weekly-domfe-tv-mark[^}]*order:\s*-1[^}]*display:\s*grid/s);
  assert.match(css, /\.history-aside[^}]*translateY\(-3vh\)/s);
  assert.match(css, /\.history-qr img[^}]*width:\s*108px[^}]*height:\s*108px/s);
  assert.match(css, /\.services-footer-message[^}]*color:\s*var\(--blue-dark\)[^}]*font-weight:\s*900/s);
  assert.match(css, /\.notice-intro[^}]*place-content:\s*center/s);
  assert.match(css, /\.notice-intro-icon[^}]*width:\s*88px[^}]*height:\s*88px/s);
  assert.match(css, /\.social-whatsapp-icon[^}]*width:\s*72px[^}]*height:\s*72px/s);
  assert.match(css, /\.message-intro-icon[^}]*width:\s*108px[^}]*height:\s*108px/s);
  assert.match(css, /\.message-intro-note[^}]*max-width:\s*1180px/s);
  assert.match(css, /\.about-intro[^}]*place-content:\s*center/s);
  assert.match(css, /\.campaign-label[^}]*border-radius:\s*999px/s);
  assert.match(css, /\.campaign-location[^}]*border-left:\s*6px solid var\(--blue\)/s);
  assert.match(css, /\.campaign-donation-options[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /\.campaign-donation-option[^}]*grid-template-columns:\s*minmax\(215px/s);
  assert.match(css, /\.notice-illustration[^}]*background:\s*transparent[^}]*box-shadow:\s*none/s);
  assert.match(css, /\.notice-layout-illustrated[^}]*1\.45fr[^}]*\.55fr/s);
  assert.match(css, /\.scene-centered \.notice-layout-illustrated[^}]*text-align:\s*left/s);
  assert.match(css, /\.notice-layout-illustrated \.notice-title-nowrap[^}]*white-space:\s*nowrap/s);
  assert.match(css, /\.notice-context[^}]*border-radius:\s*999px/s);
  assert.match(css, /\.notice-layout-illustrated \.notice-title-compact[^}]*font-size:/s);
  assert.match(css, /\.notice-image-lower \.notice-illustration[^}]*margin-top:\s*15vh/s);
  assert.match(css, /@media \(min-width:\s*981px\) and \(max-width:\s*1400px\)[\s\S]*\.notice-layout-illustrated \.notice-title-compact[^}]*font-size:/s);
  assert.match(css, /\.notice-badge[^}]*width:\s*150px[^}]*height:\s*150px/s);
  assert.match(css, /\.notice-visual-stack[^}]*justify-items:\s*center/s);
  assert.match(css, /\.history-copy \.scene-title[^}]*white-space:\s*nowrap/s);
  assert.match(css, /\.lead[^}]*clamp\(38px,/s);
  assert.match(css, /\.secondary[^}]*clamp\(28px,/s);
  assert.match(css, /prefers-reduced-motion/);
});

test('versão operacional não referencia YouTube', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const videoCode = await readFile(new URL('../src/scenes/video.js', import.meta.url), 'utf8');
  assert.equal(playlist.some(item => item.type === 'youtube'), false);
  assert.equal(playlist.some(item => /^https?:/i.test(item.src || '')), false);
  assert.doesNotMatch(videoCode, /iframe|youtube|https?:/i);
  assert.doesNotMatch(videoCode, /setTimeout|duration/);
});
