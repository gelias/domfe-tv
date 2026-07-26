const PAGES_HOST_SUFFIX = '.github.io';

export function prepareRuntimeMode(settings, playlist, hostname = globalThis.location?.hostname || '') {
  if (!hostname.endsWith(PAGES_HOST_SUFFIX)) return { settings, playlist };

  return {
    settings: {
      ...settings,
      music: { ...settings.music, src: '' }
    },
    playlist: playlist.map(item => item.type === 'video' ? {
      type: 'closing',
      duration: 9,
      title: 'Vídeo indisponível nesta versão on-line',
      text: 'A programação continuará normalmente.'
    } : item)
  };
}
