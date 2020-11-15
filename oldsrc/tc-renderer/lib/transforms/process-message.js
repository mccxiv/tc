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
  const isOutgoing = msgObject.user && !msgObject.user.id
  let msg = msgObject.message
  msg = escape(msg)
  msg = addLinks(msg)
  msg = addEmotesAsImages(msg, bttvEmotes(channel))
  msg = addEmotesAsImages(msg, ffzEmotes(channel))
  msg = twitchE
    ? addEmotesAsImages(msg, twitchEmotes(original, twitchE, isOutgoing))
    : msg
  msg = msgObject.user && msgObject.user.bits ? addBitGifs(channel, msg) : msg
  return msg
}
