import escape from './escape';
import addLinks from './add-links';
import ffzEmotes from '../emotes/ffz';
import bttvEmotes from '../emotes/bttv';
import twitchEmotes from '../emotes/twitch';
import addEmotesAsImages from './add-emotes-as-images';

export default function processMessage(message, channel, emotesFromTwitch) {
  const twitchE = emotesFromTwitch;
  let msg;
  msg = escape(message);
  msg = addLinks(msg);
  msg = addEmotesAsImages(msg, bttvEmotes(channel));
  msg = addEmotesAsImages(msg, ffzEmotes(channel));
  msg = twitchE? addEmotesAsImages(msg, twitchEmotes(message, twitchE)) : msg;
  return msg;
}
