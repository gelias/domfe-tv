import { el, section } from './helpers.js';

export function createVideoScene(item, { complete, muted }) {
  const element = section('video');
  const shell = el('div', 'video-shell');
  const video = el('video');
  video.src = item.src;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.muted = muted;
  video.setAttribute('aria-label', item.title || 'Vídeo institucional');
  shell.append(video);
  element.append(shell);
  const abort = new AbortController();
  const finish = () => complete();
  video.addEventListener('ended', finish, { once: true, signal: abort.signal });
  video.addEventListener('error', finish, { once: true, signal: abort.signal });
  return {
    element,
    pause: () => video.pause(),
    resume: () => video.play().catch(() => {}),
    setMuted: value => { video.muted = value; },
    async dispose() {
      abort.abort();
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  };
}
