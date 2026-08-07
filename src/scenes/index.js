import { createAgendaScene } from './agenda.js';
import { createArtScene } from './art.js';
import { createCampaignScene } from './campaign.js';
import { createHistoryScene } from './history.js';
import { createQuoteScene } from './quote.js';
import { createServicesScene } from './services.js';
import { createSocialsScene } from './socials.js';
import { createStudyScene } from './study.js';
import { createTextScene } from './text.js';
import { createVideoScene } from './video.js';
import { createVinhetaScene } from './vinheta.js';

const factories = {
  vinheta: createVinhetaScene,
  welcome: createTextScene,
  about: createTextScene,
  history: createHistoryScene,
  services: createServicesScene,
  socials: createSocialsScene,
  notice: item => item.noticeLayout === 'campaign' ? createCampaignScene(item) : createTextScene(item),
  agenda: createAgendaScene,
  study: createStudyScene,
  art: createArtScene,
  campaign: createCampaignScene,
  video: createVideoScene,
  message: createTextScene,
  quote: createQuoteScene,
  closing: createTextScene
};

export function createScene(item, context) {
  const factory = factories[item.type];
  if (!factory) throw new Error(`Cena não registrada: ${item.type}`);
  return factory(item, context);
}
