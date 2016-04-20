import channels from '../channels';
import axios from 'axios';
import {sleep} from '../util';

const globalEmotes = [];
const channelEmotes = {};

// TODO should retry for channel emotes too.

getGlobal();
channels.on('add', tryGrabbingChannel);
channels.on('remove', (channel) => delete channelEmotes[channel]);
channels.channels.forEach(tryGrabbingChannel);

async function getGlobal(delay) {
  await sleep(delay || 0);
  try {await fetch()}
  catch (e) {
    delay = (delay || 1000) * 2;
    console.warn('BTTV: Couldn\'t grab global emotes.', e);
    console.warn(`BTTV: Retrying in ${delay/1000} seconds.`);
    getGlobal(delay);
  }
}

async function fetch(channel) {
  const globalUrl = 'https://api.betterttv.net/2/emotes';
  const channelUrl = 'https://api.betterttv.net/2/channels/' + channel;
  const emotes = (await axios(channel? channelUrl : globalUrl)).data.emotes;
  if (channel) channelEmotes[channel] = [];
  const emotesStorage = channel? channelEmotes[channel] : globalEmotes;
  emotes.forEach((emote) => {
    emotesStorage.push({
      emote: emote.code,
      url: `http://cdn.betterttv.net/emote/${emote.id}/1x`
    });
  });
}

async function tryGrabbingChannel(channel) {
  try {await fetch(channel)}
  catch(e) {}
}

export default function getBttvEmotes(channel) {
  return globalEmotes.concat(channelEmotes[channel] || []);
}