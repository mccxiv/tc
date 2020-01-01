import channels from '../channels'
import axios from 'axios'
import {sleep} from '../util'
import {addBttvChannelEmotes, addBttvGlobalEmotes} from './menu'
import {usernameToId} from '../user-ids'

const globalEmotes = []
const channelEmotes = {}

// TODO should retry for channel emotes too.

tryGrabbingGlobal()
channels.on('add', tryGrabbingChannel)
channels.on('remove', (channel) => delete channelEmotes[channel])
channels.channels.forEach(tryGrabbingChannel)
setInterval(tryGrabbingGlobal, 1000 * 60 * 60 * 6) // Re-fetch every 12 hours

async function autoRetryAsyncFn (asyncFunction, delay = 1000, attempt = 1) {
  if (attempt > 1) await sleep(delay)
  try { await asyncFunction() } catch (e) {
    delay = (delay) * 2
    console.warn('BTTV: Couldn\'t grab emotes.', e)
    if (attempt > 30) return // Give up until the next timed fetch
    console.warn(`BTTV: Retrying in ${delay / 1000} seconds.`)
    autoRetryAsyncFn(asyncFunction, delay, attempt + 1)
  }
}

async function fetchAndStoreGlobal () {
  const url = 'https://api.betterttv.net/3/cached/emotes/global'
  const emotes = (await axios(url)).data
  if (!Array.isArray(emotes)) throw Error('Invalid emote response from BTTV')
  globalEmotes.splice(0)
  emotes.forEach((emote) => {
    globalEmotes.push({
      emote: emote.code,
      url: `http://cdn.betterttv.net/emote/${emote.id}/1x`
    })
  })
  addBttvGlobalEmotes(globalEmotes)
}

async function fetchAndStoreChannel (channel) {
  const channelId = await usernameToId(channel)
  const url = `https://api.betterttv.net/3/cached/users/twitch/${channelId}`
  const response = (await axios(url)).data
  if (
    !Array.isArray(response.channelEmotes) ||
    !Array.isArray(response.sharedEmotes)
  ) throw Error('Invalid emote response from BTTV')
  const emotes = [...response.channelEmotes, ...response.sharedEmotes]
  channelEmotes[channel] = []
  emotes.forEach((emote) => {
    channelEmotes[channel].push({
      emote: emote.code,
      url: `http://cdn.betterttv.net/emote/${emote.id}/1x`
    })
  })
  addBttvChannelEmotes(channel, channelEmotes[channel])
}

function tryGrabbingGlobal () { autoRetryAsyncFn(fetchAndStoreGlobal) }

async function tryGrabbingChannel (channel) {
  autoRetryAsyncFn(() => fetchAndStoreChannel(channel))
}

export default function getBttvEmotes (channel) {
  return globalEmotes.concat(channelEmotes[channel] || [])
}
