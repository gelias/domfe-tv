import { content, el, passiveController, reveal, section } from './helpers.js';

export function createAgendaScene(item) {
  const element = section('agenda');
  const body = content(element);
  if (Array.isArray(item.entries)) {
    body.classList.add('agenda-program');
    body.append(
      reveal('p', 'eyebrow', item.eyebrow || 'Programação mensal', 1),
      reveal('h1', 'scene-title', item.title, 2)
    );
    const schedule = el('div', `agenda-schedule agenda-schedule-${item.entries.length}`);
    item.entries.forEach((entry, index) => {
      const card = el('article', `agenda-event reveal reveal-${Math.min(index + 1, 4)}`);
      const date = el('div', 'agenda-date');
      date.append(
        el('span', 'agenda-month', entry.month || item.month || ''),
        el('strong', 'agenda-day', String(entry.day).padStart(2, '0')),
        el('span', 'agenda-weekday', entry.weekday)
      );
      const details = el('div', 'agenda-event-details');
      const talks = Array.isArray(entry.talks)
        ? entry.talks
        : [{ title: entry.title, subtitle: entry.subtitle, speaker: entry.speaker }];
      talks.forEach(talk => {
        const block = el('div', 'agenda-talk');
        block.append(el('h2', 'agenda-topic', talk.title));
        if (talk.subtitle) {
          block.classList.add('agenda-talk-with-subtitle');
          block.append(el('p', 'agenda-subtitle', talk.subtitle));
        }
        block.append(el('p', 'agenda-speaker', talk.speaker));
        details.append(block);
      });
      const meta = el('div', 'agenda-event-meta');
      meta.append(el('strong', 'agenda-time', entry.time));
      if (entry.age) meta.append(el('span', 'agenda-age', entry.age));
      details.append(meta);
      card.append(date, details);
      schedule.append(card);
    });
    body.append(schedule);
    // Keep the TV composition intact when browser zoom or window size changes.
    const fit = () => {
      if (!body.offsetWidth || !body.offsetHeight) return;
      const scale = Math.min(1,
        element.clientWidth * 0.9 / body.offsetWidth,
        element.clientHeight * 0.82 / body.offsetHeight
      );
      body.style.transform = `scale(${scale})`;
    };
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    observer.observe(body);
    return { ...passiveController(element), dispose() { observer.disconnect(); } };
  } else if (item.image) {
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
