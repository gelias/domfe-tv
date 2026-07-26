import { content, el, passiveController, reveal, section } from './helpers.js';

export function createTextScene(item) {
  const centered = item.type === 'about' || item.type === 'notice' || item.type === 'message' || item.type === 'closing';
  const element = section(item.type, centered);
  const body = content(element, centered);
  if (item.type === 'about') {
    body.classList.add('about-intro');
    const logo = el('img', 'about-intro-logo reveal reveal-1');
    logo.src = 'assets/images/logo-domfe.png';
    logo.alt = 'Associação Espírita Dom Feliciano';
    body.append(
      logo,
      reveal('h1', 'scene-title', item.title, 2),
      reveal('p', 'about-intro-note', item.text, 3)
    );
    return passiveController(element);
  }
  if (item.type === 'notice' && item.intro) {
    body.classList.add('notice-intro');
    const icon = el('img', 'notice-intro-icon reveal reveal-1');
    icon.src = 'assets/images/icone-megafone-domfe.svg';
    icon.alt = '';
    body.append(
      icon,
      reveal('h1', 'scene-title', item.title, 2),
      reveal('p', 'notice-intro-text', item.text, 3)
    );
    return passiveController(element);
  }
  if (item.type === 'message') {
    body.classList.add('message-intro');
    const icon = el('img', 'message-intro-icon reveal reveal-1');
    icon.src = 'assets/images/icone-mensagens-edificantes.svg';
    icon.alt = '';
    body.append(
      icon,
      reveal('h1', 'scene-title', item.title, 2),
      reveal('p', 'message-intro-note', item.text, 3)
    );
    return passiveController(element);
  }
  if (item.type === 'notice' && item.image) {
    body.classList.add('notice-layout');
    if (item.imageStyle === 'illustration') body.classList.add('notice-layout-illustrated');
    if (item.imageOffset === 'lower') body.classList.add('notice-image-lower');
    const copy = el('div', 'notice-copy');
    if (item.contextLabel) copy.append(reveal('div', 'notice-context', item.contextLabel, 1));
    copy.append(reveal('h1', `scene-title${item.titleNoWrap ? ' notice-title-nowrap' : ''}${item.titleCompact ? ' notice-title-compact' : ''}`, item.title, 1));
    if (item.text) copy.append(reveal('p', 'lead', item.text, 2));
    const image = el('img', `notice-image${item.imageStyle === 'illustration' ? ' notice-illustration' : ''} reveal reveal-2`);
    image.src = item.image;
    image.alt = item.imageAlt || item.title;
    if (item.badgeImage) {
      const badge = el('img', 'notice-badge reveal reveal-3');
      badge.src = item.badgeImage;
      badge.alt = item.badgeAlt || '';
      if (item.badgePlacement === 'visual') {
        body.classList.add('notice-layout-visual-badge');
        const visual = el('div', 'notice-visual-stack');
        visual.append(image, badge);
        body.append(copy, visual);
      } else {
        copy.append(badge);
        body.append(copy, image);
      }
    } else {
      body.append(copy, image);
    }
    return passiveController(element);
  }
  const copy = item.type === 'welcome' ? el('div', 'welcome-copy') : body;
  if (item.eyebrow) copy.append(reveal('div', 'eyebrow', item.eyebrow, 1));
  copy.append(reveal('h1', 'scene-title', item.title, 2));
  if (item.text) copy.append(reveal('p', 'lead', item.text, 3));
  if (item.type === 'welcome') {
    body.classList.add('welcome-layout');
    const image = el('img', 'welcome-illustration reveal reveal-3');
    image.src = 'assets/images/boas-vindas-jesus-transparente.png';
    image.alt = 'Ilustração acolhedora de Jesus com os braços abertos';
    body.append(copy, image);
  }
  return passiveController(element);
}
