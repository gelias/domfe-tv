import { content, el, passiveController, reveal, section } from './helpers.js';

export function createAgendaScene(item) {
  const element = section('agenda');
  const body = content(element);
  if (item.image) {
    body.classList.add('agenda-card-stage');
    const image = el('img', 'agenda-image reveal reveal-1');
    image.src = item.image;
    image.alt = item.title || 'Programação mensal da Domfe';
    body.append(image);
  } else {
    body.classList.add('agenda-intro');
    const icon = el('img', 'agenda-intro-icon reveal reveal-1');
    icon.src = item.icon || 'assets/images/icone-agenda.svg';
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    body.append(
      icon,
      reveal('h1', 'scene-title', item.title, 2),
      reveal('p', 'agenda-intro-text', item.text, 3)
    );
  }
  return passiveController(element);
}
