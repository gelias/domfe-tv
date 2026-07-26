import { content, el, passiveController, reveal, section } from './helpers.js';

export function createServicesScene(item) {
  const element = section('services');
  const body = content(element);
  body.append(reveal('div', 'eyebrow', item.eyebrow || 'Conheça a Domfe', 1), reveal('h1', 'scene-title', item.title, 2));

  if (item.items.some(activity => activity.day)) {
    element.classList.add('scene-weekly');
    body.classList.add('weekly-content');
    const schedule = el('div', 'weekly-schedule');
    const days = [...new Set(item.items.map(activity => activity.day))];
    days.forEach((day, dayIndex) => {
      const column = el('div', 'weekly-day-column reveal');
      column.style.setProperty('--delay', `${0.24 + dayIndex * 0.12}s`);
      const dayCard = el('section', 'weekly-day');
      dayCard.append(el('h2', 'weekly-day-title', day));
      item.items.filter(activity => activity.day === day).forEach(activity => {
        const row = el('article', 'weekly-activity');
        const time = el('time', 'weekly-time', activity.time);
        const description = el('div', 'weekly-description');
        description.append(el('strong', '', activity.title));
        if (activity.detail) description.append(el('span', activity.detailNoWrap ? 'weekly-detail-nowrap' : '', activity.detail));
        if (activity.emphasis) description.append(el('b', 'service-emphasis', activity.emphasis));
        if (activity.qrCode) {
          const qrCode = el('img', 'weekly-qr');
          qrCode.src = activity.qrCode;
          qrCode.alt = activity.qrAlt || activity.title;
          description.append(qrCode);
        }
        row.append(time, description);
        dayCard.append(row);
      });
      column.append(dayCard);
      const highlight = item.highlights?.find(entry => entry.day === day);
      if (highlight) {
        const qrOnly = highlight.qrCode && !highlight.image;
        const feature = el('aside', `weekly-highlight${highlight.qrCode && highlight.image ? ' weekly-highlight-with-qr' : ''}${qrOnly ? ' weekly-highlight-qr-only' : ''}`);
        if (highlight.image) {
          const illustration = el('img', 'weekly-highlight-image');
          illustration.src = highlight.image;
          illustration.alt = highlight.imageAlt || highlight.title;
          feature.append(illustration);
        }
        if (highlight.title || highlight.subtitle) {
          const featureCopy = el('div', 'weekly-highlight-copy');
          if (highlight.title) featureCopy.append(el('strong', '', highlight.title));
          if (highlight.subtitle) featureCopy.append(el('span', '', highlight.subtitle));
          feature.append(featureCopy);
        }
        if (highlight.qrCode) {
          const qrCode = el('img', 'weekly-highlight-qr');
          qrCode.src = highlight.qrCode;
          qrCode.alt = highlight.qrAlt || highlight.title;
          feature.append(qrCode);
        }
        if (highlight.showDomfeTvMark) {
          const brand = el('div', 'weekly-domfe-tv-mark');
          const icon = el('span', 'weekly-tv-icon');
          icon.setAttribute('aria-hidden', 'true');
          icon.append(el('span', 'weekly-tv-play'));
          brand.append(icon);
          feature.append(brand);
        }
        column.append(feature);
      }
      schedule.append(column);
    });
    body.append(schedule);
    return passiveController(element);
  }

  const grid = el('div', 'services-grid');
  if (item.centeredItems) {
    body.classList.add('services-centered');
    grid.classList.add('services-grid-centered');
  }
  item.items.forEach(({ title, detail, emphasis }, index) => {
    const card = el('article', 'service reveal');
    card.style.setProperty('--delay', `${0.24 + index * 0.08}s`);
    const information = el('span', '', detail);
    if (emphasis) information.append(el('b', 'service-emphasis', emphasis));
    card.append(el('strong', '', title), information);
    grid.append(card);
  });
  body.append(grid);
  if (item.footerMessage) body.append(reveal('p', 'services-footer-message', item.footerMessage, 4));
  return passiveController(element);
}
