import {substring} from 'stringz'

export default function twitchToTcEmotes (msg, emotesFromTwitch, isOutgoing) {
  return Object.keys(emotesFromTwitch).map((id) => {
    const indexes = emotesFromTwitch[id][0].split('-').map(Number)
    return {
      // Outgoing messsage emotes are parsed by the library instead of by Twitch
      // Unfortunately their implementations differ, so we handle differently
      emote: isOutgoing
        ? msg.slice(indexes[0], indexes[1] + 1)
        : substring(msg, indexes[0], indexes[1] + 1),
      url: `http://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0`
    }
  })
}
