const SUPPORTED_SCENES = new Set([
  'vinheta', 'welcome', 'about', 'history', 'services', 'notice',
  'agenda', 'campaign', 'study', 'art', 'socials', 'video', 'message', 'quote', 'closing'
]);

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Não foi possível carregar ${path} (${response.status}).`);
  return response.json();
}

export function expandAgenda(playlist, files) {
  const agendaFiles = Array.isArray(files) ? files.filter(file => typeof file === 'string') : [];
  return playlist.flatMap(item => {
    if (item.type !== 'agenda' || !item.dynamicSource) return [item];
    return agendaFiles.map((image, index) => ({
      type: 'agenda',
      duration: item.duration,
      title: index === 0 ? 'Programação mensal' : `Programação mensal — semana ${index}`,
      image
    }));
  });
}

async function loadAgendaFiles() {
  try {
    const data = await loadJson('api/agenda');
    return data.files;
  } catch (error) {
    console.warn('Não foi possível descobrir os cards da programação mensal.', error);
    return [];
  }
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
  const [settings, playlist, agendaFiles] = await Promise.all([
    loadJson('config/settings.json'),
    loadJson('config/playlist.json'),
    loadAgendaFiles()
  ]);
  return validateConfig(settings, expandAgenda(playlist, agendaFiles));
}
