import { content, el, passiveController, reveal, section } from './helpers.js';

export function createStudyScene(item) {
  const element = section('study');
  const body = content(element);
  body.classList.add('study-content');
  body.append(
    reveal('div', 'eyebrow', item.eyebrow || 'Formação doutrinária', 1),
    reveal('h1', 'scene-title', item.title, 2)
  );

  const layout = el('div', 'study-layout');
  const information = el('div', 'study-information');
  const grid = el('div', 'study-grid');
  item.initiatives.forEach((initiative, index) => {
    const card = el('article', 'study-card reveal');
    card.style.setProperty('--delay', `${0.32 + index * 0.12}s`);
    const number = el('span', 'study-number', String(index + 1).padStart(2, '0'));
    const copy = el('div', 'study-copy');
    copy.append(el('h2', '', initiative.title));
    if (initiative.detail) copy.append(el('p', '', initiative.detail));
    card.append(number, copy);
    grid.append(card);
  });

  information.append(grid, reveal('p', 'study-footer', item.footer, 4));
  layout.append(information);

  if (item.image || item.badgeImage || item.secondaryImage) {
    const visual = el('aside', 'study-visual reveal reveal-3');
    const youthVisual = el('div', 'study-youth-visual');
    if (!item.image) youthVisual.classList.add('study-youth-visual-badge-only');
    if (item.image) {
      const image = el('img', 'study-illustration');
      image.src = item.image;
      image.alt = item.imageAlt || '';
      youthVisual.append(image);
    }
    if (item.badgeImage) {
      const badge = el('img', 'study-badge');
      badge.src = item.badgeImage;
      badge.alt = item.badgeAlt || '';
      youthVisual.append(badge);
    }
    visual.append(youthVisual);
    if (item.secondaryImage) {
      const secondaryImage = el('img', 'study-online-illustration');
      secondaryImage.src = item.secondaryImage;
      secondaryImage.alt = item.secondaryImageAlt || '';
      visual.append(secondaryImage);
    }
    layout.append(visual);
  }

  body.append(layout);
  return passiveController(element);
}
