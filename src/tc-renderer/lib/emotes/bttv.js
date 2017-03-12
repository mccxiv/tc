import channels from '../channels'
import axios from 'axios'
import {sleep} from '../util'

const globalEmotes = []
const channelEmotes = {}

// TODO should retry for channel emotes too.

getGlobal()
channels.on('add', tryGrabbingChannel)
channels.on('remove', (channel) => delete channelEmotes[channel])
channels.channels.forEach(tryGrabbingChannel)
setInterval(getGlobal, 1000 * 60 * 60 * 6) // Re-fetch every 12 hours

async function getGlobal (delay = 0, attempt = 1) {
  await sleep(delay)
  try { await fetch() } catch (e) {
    delay = (delay || 1000) * 2
    console.warn('BTTV: Couldn\'t grab global emotes.', e)
    if (attempt > 30) return // Give up until the next timed fetch
    console.warn(`BTTV: Retrying in ${delay / 1000} seconds.`)
    getGlobal(delay, attempt + 1)
  }
}

async function fetch (channel) {
  const globalUrl = 'https://api.betterttv.net/2/emotes'
  const channelUrl = 'https://api.betterttv.net/2/channels/' + channel
  const emotes = (await axios(channel ? channelUrl : globalUrl)).data.emotes
  if (channel) channelEmotes[channel] = []
  if (!channel) globalEmotes.splice(0)
  const emotesStorage = channel ? channelEmotes[channel] : globalEmotes
  emotes.forEach((emote) => {
    emotesStorage.push({
      emote: emote.code,
      url: `http://cdn.betterttv.net/emote/${emote.id}/1x`
    })
  })
}

async function tryGrabbingChannel (channel) {
  try { await fetch(channel) } catch (e) {}
}

export default function getBttvEmotes (channel) {
  return globalEmotes.concat(channelEmotes[channel] || [])
}
