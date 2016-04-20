export default function twitchEmotesToTcEmotesFormat(msg, emotesFromTwitch) {
  return Object.keys(emotesFromTwitch).map((id) => {
    const indexes = emotesFromTwitch[id][0].split('-').map(Number);
    return {
      emote: msg.substring(indexes[0], indexes[1] + 1),
      url: `http://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0`
    };
  });
}