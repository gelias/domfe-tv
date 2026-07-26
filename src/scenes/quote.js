import { content, passiveController, reveal, section } from './helpers.js';

export function createQuoteScene(item) {
  const element = section('quote', true);
  const body = content(element, true);
  body.classList.add('quote-card');
  body.append(reveal('blockquote', 'quote-text', `“${item.quote}”`, 1));
  body.append(reveal('p', 'secondary quote-source', item.source, 2));
  return passiveController(element);
}
