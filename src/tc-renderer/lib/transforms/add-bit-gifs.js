import axios from 'axios';
import settings from '../settings/settings';

let bits;

fetchBitsConfig();

async function fetchBitsConfig() {
  bits = (await axios('https://www.twitch.tv/bits/config.json')).data.bits;
  bits.tiers.reverse();
}

function getBitGifUrl(amount) {
  if (!bits) return;
  const tier = bits.tiers.find(tier => tier.min_bits <= amount);
  if (!tier) return;
  const theme = settings.theme.dark ? 'dark' : 'light';
  return `https://static-cdn.jtvnw.net/bits/${theme}/animated/${tier.image}/1`;
}

function makeImg(cheerText) {
  const amount = Number(cheerText.replace('cheer', ''));
  const bitGifUrl = getBitGifUrl(amount);
  if (!bitGifUrl) return cheerText;
  const meta = `data-emote-name="${cheerText}" alt="${cheerText}"`;
  return `<img class="emoticon" ${meta} src="${bitGifUrl}">${amount}`;
}

export default function addBitGifs(message) {
  const regString = `(?<=(?:^| ))cheer\\d+(?=(?: |$))(?!(?:[^<]*>))`;
  const re = new RegExp(regString, 'g');
  return message.replace(re, makeImg);
}
