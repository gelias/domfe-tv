import { content, el, passiveController, reveal, section } from './helpers.js';

const ICONS = {
  youtube: '▶',
  instagram: '◎',
  facebook: 'f',
  blog: 'W'
};

export function createSocialsScene(item) {
  const element = section('socials');
  const body = content(element);
  body.classList.add('socials-content');
  body.append(
    reveal('div', 'eyebrow', item.eyebrow || 'Conecte-se com a Domfe', 1),
    reveal('h1', 'scene-title', item.title, 2)
  );

  const layout = el('div', 'socials-layout reveal reveal-3');
  const channels = el('div', 'social-channels');
  item.channels.forEach(channel => {
    const card = el('div', `social-channel social-${channel.kind}`);
    const icon = el('span', 'social-icon', ICONS[channel.kind] || '•');
    icon.setAttribute('aria-hidden', 'true');
    const copy = el('div', 'social-channel-copy');
    copy.append(el('strong', '', channel.label), el('span', '', channel.display));
    card.append(icon, copy);
    channels.append(card);
  });

  const whatsapp = el('aside', 'social-whatsapp');
  const whatsappIcon = el('img', 'social-whatsapp-icon');
  whatsappIcon.src = 'assets/images/icone-whatsapp.svg';
  whatsappIcon.alt = '';
  whatsapp.append(
    whatsappIcon,
    el('strong', '', 'WhatsApp'),
    el('span', 'social-whatsapp-number', item.whatsapp.display)
  );
  const qr = el('img', 'social-whatsapp-qr');
  qr.src = item.whatsapp.qrCode;
  qr.alt = 'QR Code para conversar com a Domfe pelo WhatsApp';
  whatsapp.append(qr, el('small', '', 'Aponte a câmera e fale conosco'));

  layout.append(channels, whatsapp);
  body.append(layout);
  return passiveController(element);
}
