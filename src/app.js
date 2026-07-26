import { AudioManager } from './core/audio-manager.js';
import { loadConfig } from './core/config-loader.js';
import { PlaylistEngine } from './core/playlist-engine.js';
import { prioritizeNoticesForDay } from './core/notice-order.js';
import { prepareRuntimeMode } from './core/runtime-mode.js';
import { createScene } from './scenes/index.js';

const stage = document.getElementById('stage');
const sceneHost = document.getElementById('sceneHost');
const curtain = document.getElementById('transitionCurtain');
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');
const status = document.getElementById('status');
const audio = document.getElementById('backgroundAudio');
const pauseButton = document.getElementById('pauseButton');
const muteButton = document.getElementById('muteButton');

let settings;
let playlist;
let engine;
let audioManager;
let currentElement = null;
let muted = false;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function activate(item, _index, context) {
  const video = item.type === 'video';
  const leavingVideo = currentElement?.dataset.type === 'video';
  const useCurtain = video || leavingVideo;
  const transitionPartMs = settings.transitionMs / 2;
  if (useCurtain) {
    curtain.classList.add('is-active');
    await wait(450);
  }
  if (video) {
    await audioManager.fadeOutAndPause();
  }

  const controller = createScene(item, { ...context, muted });
  const incoming = controller.element;
  const outgoing = currentElement;
  sceneHost.append(incoming);
  await new Promise(requestAnimationFrame);

  if (outgoing) {
    outgoing.classList.add('is-exiting');
    await wait(transitionPartMs);
    outgoing.remove();
  }

  incoming.classList.add('is-active');
  currentElement = incoming;

  if (!video) audioManager.fadeIn();
  await wait(transitionPartMs);
  curtain.classList.remove('is-active');
  return controller;
}

function setStatus(message, error = false) {
  status.textContent = message;
  status.classList.toggle('is-error', error);
}

async function prepare() {
  try {
    ({ settings, playlist } = await loadConfig());
    ({ settings, playlist } = prepareRuntimeMode(settings, playlist));
    playlist = prioritizeNoticesForDay(playlist);
    document.documentElement.style.setProperty('--scene-transition', `${settings.transitionMs / 2}ms`);
    audio.src = settings.music?.src || '';
    audioManager = new AudioManager(audio, settings.music);
    engine = new PlaylistEngine({ playlist, settings, activate });
    startButton.disabled = false;
    setStatus('Programação pronta para iniciar.');
  } catch (error) {
    console.error(error);
    setStatus(error.message, true);
  }
}

startButton.addEventListener('click', async () => {
  startButton.disabled = true;
  startOverlay.classList.add('is-hidden');
  await audioManager.fadeIn();
  await engine.start();
});

document.getElementById('nextButton').addEventListener('click', () => engine?.next());
document.getElementById('prevButton').addEventListener('click', () => engine?.previous());
pauseButton.addEventListener('click', () => {
  if (!engine) return;
  if (engine.paused) {
    engine.resume();
    if (!engine.isVideo()) audioManager.fadeIn();
  } else {
    engine.pause();
    audioManager.pause();
  }
  pauseButton.textContent = engine.paused ? '▶' : '⏸';
  pauseButton.setAttribute('aria-label', engine.paused ? 'Continuar' : 'Pausar');
});

muteButton.addEventListener('click', () => {
  muted = !muted;
  audioManager?.setMuted(muted);
  engine?.controller?.setMuted?.(muted);
  muteButton.textContent = muted ? '🔇' : '🔊';
  muteButton.setAttribute('aria-label', muted ? 'Ativar som' : 'Silenciar');
});

async function toggleFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
  else await stage.requestFullscreen().catch(() => {});
}

document.getElementById('fullscreenButton').addEventListener('click', toggleFullscreen);
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') engine?.next();
  if (event.key === 'ArrowLeft') engine?.previous();
  if (event.key === ' ') { event.preventDefault(); pauseButton.click(); }
  if (event.key.toLowerCase() === 'm') muteButton.click();
  if (event.key.toLowerCase() === 'f') toggleFullscreen();
});

window.addEventListener('beforeunload', () => engine?.destroy());
prepare();
