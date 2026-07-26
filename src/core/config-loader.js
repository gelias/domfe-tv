const SUPPORTED_SCENES = new Set([
  'vinheta', 'welcome', 'about', 'history', 'services', 'notice',
  'agenda', 'campaign', 'socials', 'video', 'message', 'quote', 'closing'
]);

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Não foi possível carregar ${path} (${response.status}).`);
  return response.json();
}

export function validateConfig(settings, playlist) {
  if (!settings || typeof settings !== 'object') throw new Error('Configurações inválidas.');
  if (!Array.isArray(playlist) || playlist.length === 0) throw new Error('A playlist está vazia.');
  playlist.forEach((item, index) => {
    if (!SUPPORTED_SCENES.has(item?.type)) throw new Error(`Cena ${index + 1}: tipo inválido.`);
    if (item.type === 'video') {
      if (!item.src) throw new Error(`Cena ${index + 1}: vídeo local não informado.`);
    } else if (!(Number(item.duration ?? settings.defaultDuration) > 0)) {
      throw new Error(`Cena ${index + 1}: duração inválida.`);
    }
  });
  return { settings, playlist };
}

export async function loadConfig() {
  const [settings, playlist] = await Promise.all([
    loadJson('config/settings.json'),
    loadJson('config/playlist.json')
  ]);
  return validateConfig(settings, playlist);
}
