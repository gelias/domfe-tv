import assert from 'node:assert/strict';
import test from 'node:test';
import { expandAgenda, validateConfig } from '../src/core/config-loader.js';
import { readFile } from 'node:fs/promises';

test('aceita playlist local válida', () => {
  const result = validateConfig(
    { defaultDuration: 10, loop: true },
    [{ type: 'welcome', duration: 5 }, { type: 'video', src: 'assets/video/test.mp4' }]
  );
  assert.equal(result.playlist.length, 2);
});

test('boas-vindas anuncia o início das atividades no plural', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const welcome = playlist.find(item => item.type === 'welcome');
  assert.match(welcome.text, /iniciaremos nossas atividades\.$/);
});

test('rejeita vídeo sem arquivo local', () => {
  assert.throws(
    () => validateConfig({ defaultDuration: 10 }, [{ type: 'video', src: '' }]),
    /vídeo local não informado/
  );
});

test('expande a agenda dinâmica na ordem recebida e remove a cena-modelo', () => {
  const playlist = [
    { type: 'welcome', duration: 5 },
    { type: 'agenda', duration: 12, dynamicSource: 'content/agenda' },
    { type: 'closing', duration: 5 }
  ];
  const expanded = expandAgenda(playlist, [
    'content/agenda/mes.png',
    'content/agenda/semana1.png',
    'content/agenda/semana2.png'
  ]);
  assert.deepEqual(expanded.filter(item => item.type === 'agenda').map(item => item.image), [
    'content/agenda/mes.png',
    'content/agenda/semana1.png',
    'content/agenda/semana2.png'
  ]);
  assert.equal(expanded.some(item => item.dynamicSource), false);
});

test('agenda dinâmica sem arquivos não deixa cena vazia', () => {
  const expanded = expandAgenda([{ type: 'agenda', duration: 12, dynamicSource: 'content/agenda' }], []);
  assert.deepEqual(expanded, []);
});

test('programação mensal usa 12 segundos na abertura e 22 segundos por card', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const agenda = playlist.filter(item => item.type === 'agenda');
  assert.equal(agenda[0].duration, 12);
  assert.equal(agenda[1].duration, 22);
  const expanded = expandAgenda(agenda, ['content/agenda/mes.png', 'content/agenda/semana1.png']);
  assert.deepEqual(expanded.map(item => item.duration), [12, 22, 22]);
});

test('playlist inclui todos os grupos de atividades do flyer', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const titles = playlist
    .filter(item => item.type === 'services')
    .flatMap(item => [
      ...item.items.map(activity => activity.title)
    ])
    .join(' | ');
  for (const expected of [
    'Exposição doutrinária',
    'obsessão e desobsessão',
    'Evangelização infantojuvenil',
    'Estudo Sistematizado',
    'Obras Básicas',
    'Preces e irradiações',
    'Caravanas e Evangelho no Lar',
    'Atendimento e diálogo fraterno'
  ]) assert.match(titles, new RegExp(expected, 'i'));
});

test('cena histórica aponta para o site oficial da Domfe', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const history = playlist.find(item => item.type === 'history');
  assert.equal(history.website, 'https://domfe.wordpress.com');
  assert.equal(history.duration, 28);
});

test('cena de canais divulga redes sociais e WhatsApp da Domfe', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const socials = playlist.find(item => item.type === 'socials');
  assert.ok(socials);
  assert.equal(socials.channels.length, 4);
  assert.equal(socials.whatsapp.url, 'https://wa.me/5551994176173');
  assert.match(socials.channels.map(channel => channel.url).join(' '), /youtube.*instagram.*facebook.*wordpress/i);
  assert.equal(playlist.at(-1).type, 'socials');
  assert.equal(playlist.at(-2).type, 'video');
});

test('avisos começam com introdução e aceitam cenas subsequentes', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const notices = playlist.filter(item => item.type === 'notice');
  assert.equal(notices[0].intro, true);
  assert.equal(notices[0].title, 'Avisos da Casa');
  assert.equal(notices.length, 8);
  assert.deepEqual(notices.slice(1, 7).map(item => item.title), [
    'Você é muito bem-vindo',
    'Celular no silencioso',
    'Nas exposições doutrinárias',
    'Nas exposições de desobsessão',
    'Recomendada para maiores de 12 anos',
    'Passe e fluidoterapia'
  ]);
  assert.equal(notices[7].noticeLayout, 'campaign');
  assert.equal(notices[7].duration, 28);
  assert.deepEqual(notices[7].donationOptions.map(option => option.value), [
    '04.043.306/0001-86',
    'WhatsApp (51) 99940-4397'
  ]);
  assert.match(notices[7].donationOptions[1].note, /entrega na Domfe/i);
  assert.equal(notices.find(item => item.title === 'Passe e fluidoterapia').image, 'assets/images/aviso-passe-maos-acima.png');
  assert.equal(notices.find(item => item.title === 'Aprender e crescer em família'), undefined);
  assert.doesNotMatch(notices.find(item => item.title === 'Nas exposições doutrinárias').text, /terças, quintas e sextas/i);
  assert.equal(notices.find(item => item.title === 'Nas exposições doutrinárias').contextLabel, 'Terças, quintas e sextas');
  assert.equal(notices.find(item => item.title === 'Nas exposições de desobsessão').noticeGroup, 'monday');
  assert.match(notices.find(item => item.title === 'Nas exposições de desobsessão').text, /Evangelho.*duas exposições.*fluidoterapia e passe/is);
  assert.equal(notices.find(item => item.title === 'Nas exposições de desobsessão').titleCompact, true);
  assert.equal(notices.find(item => item.title === 'Nas exposições de desobsessão').imageOffset, 'lower');
  assert.equal(notices.find(item => item.title === 'Recomendada para maiores de 12 anos').contextLabel, 'Segundas-feiras • 20h15');
  assert.equal(notices.find(item => item.title === 'Como acontece a reunião'), undefined);
  assert.match(notices.find(item => item.title === 'Recomendada para maiores de 12 anos').text, /Evangelização aos sábados/i);
});

test('início da semana inclui destaque ilustrado contextual', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const start = playlist.find(item => item.type === 'services' && item.title === 'Início da semana');
  assert.equal(start.highlights[0].day, 'Segunda-feira');
  assert.equal(start.highlights[0].image, 'assets/images/inicio-semana-estudo-acessivel.png');
  assert.match(start.highlights[0].imageAlt, /cadeirante/i);
});

test('agenda semanal usa Oficinas de arte no sábado', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const saturday = playlist.find(item => item.type === 'services' && item.title === 'Final da semana');
  assert.ok(saturday.items.some(item => item.day === 'Sábado' && item.title === 'Oficinas de arte'));
});

test('Preces e irradiações orienta o acesso pelo QR Code', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const middle = playlist.find(item => item.type === 'services' && item.title === 'Meio da semana');
  const prayers = middle.items.find(item => item.title === 'Preces e irradiações');
  assert.equal(prayers.detail, 'Canal do YouTube • Acesse pelo QR');
  assert.equal(prayers.detailNoWrap, true);
});

test('Mensagens Edificantes começam com introdução antes das citações', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const introIndex = playlist.findIndex(item => item.type === 'message' && item.title === 'Mensagens Edificantes');
  const quoteIndex = playlist.findIndex(item => item.type === 'quote');
  assert.ok(introIndex >= 0);
  assert.equal(quoteIndex, introIndex + 1);
  assert.match(playlist[introIndex].text, /^Em instantes iniciaremos nossas atividades\. Aproveite este momento/i);
  assert.equal(playlist[introIndex].eyebrow, undefined);
  assert.deepEqual(
    playlist.slice(introIndex + 1, introIndex + 5).map(item => item.title),
    ['Renovar para viver melhor', 'Semear o futuro', 'Educação que ilumina', 'O bem começa em casa']
  );
  assert.deepEqual(
    playlist.slice(introIndex + 1, introIndex + 5).map(item => item.source),
    [
      'Apóstolo Paulo — Romanos 12:2',
      'Emmanuel — Taça de Luz',
      'Joanna de Ângelis',
      'Emmanuel — Educação Evangélica'
    ]
  );
  assert.ok(playlist.filter(item => item.type === 'quote').every(item => item.duration === 15));
});

test('Conheça a Domfe começa com capa e sequencia história e atividades', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const coverIndex = playlist.findIndex(item => item.type === 'about');
  assert.equal(playlist[coverIndex].title, 'Conheça a Domfe');
  assert.equal(playlist[coverIndex + 1].type, 'history');
  assert.deepEqual(
    playlist.slice(coverIndex + 2, coverIndex + 7).map(item => item.title),
    ['Início da semana', 'Meio da semana', 'Final da semana', 'Estude o Espiritismo', 'Acolhimento e serviço']
  );
});

test('inclui os programas Estude o Espiritismo e Arte Espírita em Destaque', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const study = playlist.find(item => item.type === 'study');
  const art = playlist.find(item => item.type === 'art');

  assert.equal(study.title, 'Estude o Espiritismo');
  assert.equal(study.duration, 32);
  assert.deepEqual(study.initiatives.map(item => item.title), [
    'Evangelização Infantojuvenil + Ciclo de Pais e Responsáveis',
    'Estudo Sistematizado da Doutrina Espírita',
    'Estudo das Obras Básicas'
  ]);
  assert.deepEqual(study.initiatives.map(item => item.detail), ['Aos sábados', 'Presencial', 'Presencial e on-line']);
  assert.equal(study.image, undefined);
  assert.equal(study.badgeImage, 'assets/images/logo-domfe-jovem.png');
  assert.equal(study.secondaryImage, 'assets/images/estudo-online.svg');
  assert.match(study.footer, /procure a recepção/i);
  assert.equal(art.title, 'Arte Espírita em Destaque');
  assert.equal(art.eyebrow, undefined);
  assert.equal(art.text, undefined);
  assert.equal(playlist[playlist.indexOf(art) + 1].title, 'Oficinas de Arte');
  assert.equal(playlist[playlist.indexOf(art) + 1].type, 'art');
  assert.equal(playlist[playlist.indexOf(art) + 1].duration, 28);
  assert.deepEqual(playlist[playlist.indexOf(art) + 1].highlights.map(item => item.label), ['Quando', 'Para quem', 'Evangelização']);
  assert.equal(playlist[playlist.indexOf(art) + 2].title, 'Mensagens Edificantes');
});
