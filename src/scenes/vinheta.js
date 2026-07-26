import { content, el, passiveController, reveal, section } from './helpers.js';

export function createVinhetaScene() {
  const element = section('vinheta', true);
  const body = content(element, true);
  const institutional = el('img', 'institutional-logo vignette-institutional');
  institutional.src = 'assets/images/logo-domfe.png';
  institutional.alt = 'Associação Espírita Dom Feliciano';
  body.append(institutional);

  const brand = el('div', 'domfe-tv-mark vignette-tv-intro');
  const icon = el('span', 'tv-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.append(el('span', 'tv-play'));
  brand.append(icon, el('span', 'domfe-tv-name', 'DOMFE TV'));
  element.append(brand);

  const slogan = el('p', 'slogan vignette-slogan');
  ['Acolhimento', 'Estudo', 'Vivência'].forEach((word, index) => {
    if (index > 0) slogan.append(el('b', `slogan-separator slogan-separator-${index}`, '•'));
    slogan.append(el('span', `slogan-word slogan-word-${index + 1}`, word));
  });
  const handwritten = el('p', 'vignette-handwritten');
  const handwrittenText = 'Domfe! Juntos somos melhores!';
  handwritten.setAttribute('aria-label', handwrittenText);
  Array.from(handwrittenText).forEach((character, index) => {
    const letter = el('span', 'handwritten-letter', character);
    letter.setAttribute('aria-hidden', 'true');
    letter.style.setProperty('--letter-delay', `${7.15 + index * 0.085}s`);
    handwritten.append(letter);
  });
  body.append(slogan, handwritten);
  return passiveController(element);
}
