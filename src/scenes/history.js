import { content, el, passiveController, reveal, section } from './helpers.js';

export function createHistoryScene(item) {
  const element = section('history');
  const body = content(element);
  body.classList.add('history-layout');
  const copy = el('div', 'history-copy');
  copy.append(
    reveal('div', 'eyebrow', 'Nossa história', 1),
    reveal('h1', 'scene-title', item.title, 2),
    reveal('p', 'lead', item.text, 3),
    reveal('p', 'secondary', 'Referência histórica: site oficial da Domfe', 4)
  );
  const aside = el('div', 'history-aside');
  const figure = el('figure', 'portrait reveal reveal-3');
  const image = el('img');
  image.src = item.image;
  image.alt = 'Retrato de Dom Feliciano José Rodrigues de Araújo Prates';
  image.addEventListener('error', () => {
    if (!image.dataset.fallback) {
      image.dataset.fallback = 'true';
      image.src = 'assets/images/dom-feliciano.png';
    }
  }, { once: true });
  figure.append(image, el('figcaption', '', 'Dom Feliciano José Rodrigues de Araújo Prates'));

  const qrCard = el('div', 'history-qr reveal reveal-4');
  const qr = el('img');
  qr.src = 'assets/images/qrcode-site-domfe.svg';
  qr.alt = `QR Code para acessar ${item.website || 'o site da Domfe'}`;
  qrCard.append(qr);
  aside.append(figure, qrCard);
  body.append(copy, aside);
  return passiveController(element);
}
