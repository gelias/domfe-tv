import { content, el, passiveController, reveal, section } from './helpers.js';

export function createCampaignScene(item) {
  const element = section(item.type === 'notice' ? 'notice' : 'campaign');
  element.classList.add('scene-campaign');
  const body = content(element);
  const card = el('div', 'campaign-card');
  const image = el('img', 'campaign-image');
  image.src = 'assets/images/campanha-cestas-basicas.png';
  image.alt = 'Cestas básicas completas sendo entregues em uma ação solidária';
  const copy = el('div', 'campaign-copy');
  copy.append(
    reveal('div', 'campaign-label', item.title, 1),
    reveal('h1', 'campaign-headline', item.headline, 2),
    reveal('p', 'campaign-action', item.text, 3)
  );
  if (item.donationOptions?.length) {
    const options = el('div', 'campaign-donation-options reveal reveal-4');
    item.donationOptions.forEach(option => {
      const optionCard = el('div', 'campaign-donation-option');
      optionCard.append(
        el('strong', 'campaign-donation-label', option.label),
        el('span', 'campaign-donation-value', option.value)
      );
      if (option.note) optionCard.append(el('small', 'campaign-donation-note', option.note));
      options.append(optionCard);
    });
    copy.append(options);
  }
  copy.append(reveal('p', 'campaign-location', item.footer, 5));
  card.append(image, copy);
  body.append(card);
  return passiveController(element);
}
