import { content, passiveController, reveal, section } from './helpers.js';

export function createQuoteScene(item) {
  const element = section('quote', true);
  const body = content(element, true);
  body.classList.add('quote-card');
  if (item.title) body.append(reveal('h1', 'scene-title quote-title', item.title, 1));
  body.append(reveal('blockquote', 'quote-text', `“${item.quote}”`, item.title ? 2 : 1));
  body.append(reveal('p', 'secondary quote-source', item.source, item.title ? 3 : 2));
  return passiveController(element);
}
