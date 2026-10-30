export async function prepareDesktopMedia(status, bridge = globalThis.domfeDesktop) {
  if (!bridge) return;
  status.classList.add('media-setup-status');
  const progress = document.createElement('progress');
  progress.className = 'media-progress';
  progress.max = 1;
  progress.setAttribute('aria-label', 'Preparação das mídias');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Tentar novamente';
  retry.hidden = true;
  status.after(progress, retry);
  const unsubscribe = bridge.onMediaProgress(update => {
    status.classList.remove('is-error');
    if (update.phase === 'checking') {
      progress.removeAttribute('value');
      status.textContent = `Conferindo ${update.label.toLocaleLowerCase('pt-BR')}…`;
    } else if (update.phase === 'downloading') {
      progress.value = update.received / update.totalBytes;
      const percent = Math.floor(progress.value * 100);
      status.textContent = `Preparando mídias: ${percent}% — ${update.label}. Na primeira vez, precisamos de internet.`;
    } else if (update.phase === 'ready') {
      progress.value = 1;
      status.textContent = 'Mídias prontas para uso offline.';
    }
  });
  const cleanup = () => unsubscribe();
  window.addEventListener('beforeunload', cleanup, { once: true });
  try {
    while (true) {
      let result;
      try {
        result = await bridge.prepareMedia();
      } catch {
        result = { ok: false, message: 'Não foi possível preparar as mídias. Tente novamente.' };
      }
      if (result.ok) return;
      status.textContent = result.message;
      status.classList.add('is-error');
      progress.hidden = true;
      retry.hidden = false;
      await new Promise(resolve => retry.addEventListener('click', resolve, { once: true }));
      retry.hidden = true;
      progress.hidden = false;
      progress.removeAttribute('value');
    }
  } finally {
    cleanup();
    window.removeEventListener('beforeunload', cleanup);
    progress.remove();
    retry.remove();
    status.classList.remove('media-setup-status');
  }
}
