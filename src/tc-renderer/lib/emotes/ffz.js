import axios from 'axios';
import {sleep} from '../util';
import channels from '../channels';

var globalEmotes = [];
var channelEmotes = {};

cacheGlobal();
channels.on('add', cache);
channels.on('remove', remove);
channels.channels.forEach(cache);

async function cacheGlobal(delay) {
  delay = delay || 0;
  await sleep(delay);
  try {
    const response = await axios('http://api.frankerfacez.com/v1/set/global');
    const emotes = response.data;
    emotes.default_sets.forEach((setKey) => {
      emotes.sets[setKey].emoticons.forEach((emote) => {
        globalEmotes.push({
          emote: emote.name,
          url: 'http:' + emote.urls['1']
        });
      })
    });
  }
  catch(e) {
    cacheGlobal((delay || 1000) * 2);
  }
}

async function cache(channel) {
  channelEmotes[channel] = [];
  const url = 'http://api.frankerfacez.com/v1/room/' + channel;
  try {
    const response = await axios(url);
    const data = response.data;
    data.sets[data.room.set].emoticons.forEach((emote) => {
      channelEmotes[channel].push({
        emote: emote.name,
        url: 'http:' + emote.urls['1']
      });
    });
  }
  catch(e) {console.log('NO!')}
}

function remove(channel) {
  delete channelEmotes[channel];
}

export default function getFfzEmotes(channel) {
  return globalEmotes.concat(channelEmotes[channel] || []);
}
