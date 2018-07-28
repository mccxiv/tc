import escape from './escape'
import addLinks from './add-links'
import ffzEmotes from '../emotes/ffz'
import bttvEmotes from '../emotes/bttv'
import addBitGifs from './add-bit-gifs'
import twitchEmotes from '../emotes/twitch'
import addEmotesAsImages from './add-emotes-as-images'

export default function processMessage (msgObject, channel, emotesFromTwitch) {
  const twitchE = emotesFromTwitch
  const original = msgObject.message
  let msg = msgObject.message
  msg = escape(msg)
  msg = addLinks(msg)
  msg = addEmotesAsImages(msg, bttvEmotes(channel))
  msg = addEmotesAsImages(msg, ffzEmotes(channel))
  msg = twitchE ? addEmotesAsImages(msg, twitchEmotes(original, twitchE)) : msg
  msg = msgObject.tags && msgObject.tags.bits ? addBitGifs(channel, msg) : msg
  return msg
}
