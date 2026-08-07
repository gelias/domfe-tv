import { content, el, passiveController, reveal, section } from './helpers.js';

export function createArtScene(item) {
  const element = section('art', true);
  const body = content(element, true);
  if (item.image) {
    element.classList.add('scene-art-card');
    body.classList.add('art-card-stage');
    const image = el('img', 'art-card-image reveal reveal-1');
    image.src = item.image;
    image.alt = item.imageAlt || item.title || 'Conteúdo do programa Arte Espírita em Destaque';
    if (item.highlights?.length) {
      body.classList.add('art-feature-layout');
      const copy = el('div', 'art-feature-copy');
      copy.append(
        reveal('div', 'eyebrow', item.eyebrow || 'Atividade para toda a família', 1),
        reveal('h1', 'scene-title', item.title, 2)
      );
      const highlights = el('div', 'art-feature-highlights');
      item.highlights.forEach((highlight, index) => {
        const card = el('article', 'art-feature-highlight reveal');
        card.style.setProperty('--delay', `${0.35 + index * 0.1}s`);
        card.append(
          el('span', 'art-feature-label', highlight.label),
          el('strong', 'art-feature-value', highlight.value)
        );
        highlights.append(card);
      });
      copy.append(highlights);
      if (item.footer) copy.append(reveal('p', 'art-feature-footer', item.footer, 4));
      body.append(image, copy);
    } else {
      body.append(image);
    }
    return passiveController(element);
  }

  body.classList.add('art-intro');
  const icon = el('img', 'art-intro-icon reveal reveal-1');
  icon.src = item.icon || 'assets/images/icone-arte-espirita.svg';
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  body.append(icon);
  if (item.eyebrow) body.append(reveal('div', 'eyebrow', item.eyebrow, 2));
  body.append(reveal('h1', 'scene-title', item.title, item.eyebrow ? 3 : 2));
  if (item.text) body.append(reveal('p', 'art-intro-note', item.text, item.eyebrow ? 4 : 3));
  return passiveController(element);
}
