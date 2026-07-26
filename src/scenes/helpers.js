export function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function section(type, centered = false) {
  const node = el('section', `scene scene-${type}${centered ? ' scene-centered' : ''}`);
  node.dataset.type = type;
  node.setAttribute('aria-label', type);
  return node;
}

export function content(parent, centered = false) {
  const node = el('div', `scene-content${centered ? ' center' : ''}`);
  parent.append(node);
  return node;
}

export function reveal(tag, className, text, order = 1) {
  return el(tag, `${className} reveal reveal-${order}`, text);
}

export function passiveController(element) {
  return { element, pause() {}, resume() {}, setMuted() {}, dispose() {} };
}
