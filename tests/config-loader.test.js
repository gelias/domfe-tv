import assert from 'node:assert/strict';
import test from 'node:test';
import { validateConfig } from '../src/core/config-loader.js';
import { readFile } from 'node:fs/promises';

test('aceita playlist local válida', () => {
  const result = validateConfig(
    { defaultDuration: 10, loop: true },
    [{ type: 'welcome', duration: 5 }, { type: 'video', src: 'assets/video/test.mp4' }]
  );
  assert.equal(result.playlist.length, 2);
});

test('rejeita vídeo sem arquivo local', () => {
  assert.throws(
    () => validateConfig({ defaultDuration: 10 }, [{ type: 'video', src: '' }]),
    /vídeo local não informado/
  );
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
  assert.equal(notices.length, 10);
  assert.deepEqual(notices.slice(1, 8).map(item => item.title), [
    'Você é muito bem-vindo',
    'Celular no silencioso',
    'Nas exposições doutrinárias',
    'Nas exposições de desobsessão',
    'Recomendada para maiores de 12 anos',
    'Passe e fluidoterapia',
    'Aprender e crescer em família'
  ]);
  assert.ok(notices[8].image);
  assert.equal(notices[9].noticeLayout, 'campaign');
  assert.deepEqual(notices[9].donationOptions.map(option => option.value), [
    '04.043.306/0001-86',
    'WhatsApp (51) 99940-4397'
  ]);
  assert.match(notices[9].donationOptions[1].note, /entrega na Domfe/i);
  assert.equal(notices.find(item => item.title === 'Passe e fluidoterapia').image, 'assets/images/aviso-passe-maos-acima.png');
  assert.equal(notices.find(item => item.title === 'Aprender e crescer em família').titleNoWrap, true);
  assert.equal(notices.find(item => item.title === 'Aprender e crescer em família').badgeImage, 'assets/images/logo-domfe-jovem.png');
  assert.equal(notices.find(item => item.title === 'Aprender e crescer em família').badgePlacement, 'visual');
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

test('mensagens edificantes começam com introdução antes das citações', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const introIndex = playlist.findIndex(item => item.type === 'message' && item.title === 'Mensagens edificantes');
  const quoteIndex = playlist.findIndex(item => item.type === 'quote');
  assert.ok(introIndex >= 0);
  assert.equal(quoteIndex, introIndex + 1);
  assert.match(playlist[introIndex].text, /^Em instantes iniciaremos nossas atividades\. Aproveite este momento/i);
  assert.equal(playlist[introIndex].eyebrow, undefined);
});

test('Conheça a Domfe começa com capa e sequencia história e atividades', async () => {
  const playlist = JSON.parse(await readFile(new URL('../config/playlist.json', import.meta.url), 'utf8'));
  const coverIndex = playlist.findIndex(item => item.type === 'about');
  assert.equal(playlist[coverIndex].title, 'Conheça a Domfe');
  assert.equal(playlist[coverIndex + 1].type, 'history');
  assert.deepEqual(
    playlist.slice(coverIndex + 2, coverIndex + 6).map(item => item.title),
    ['Início da semana', 'Meio da semana', 'Final da semana', 'Acolhimento e serviço']
  );
});
