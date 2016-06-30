import r from 'axios';

const kraken = 'https://api.twitch.tv/kraken/';

export async function badges(channel) {
  const userId = (await user(channel))._id;
  const base = 'https://badges.twitch.tv/v1/badges/';
  const globalUrl = base + 'global/display?language=en';
  const channelUrl = base + `channels/${userId}/display?language=en`;
  const globalBadges = (await r(globalUrl)).data;
  const channelBadges = (await r(channelUrl)).data;
  const input = [{}, globalBadges.badge_sets, channelBadges.badge_sets];
  const badges = Object.assign(...input);
  return badges;
}

export async function user(channel) {
  return api('users/' + channel);
}

export async function channel(channel) {
  return api('channels/' + channel);
}

export async function stream(channel) {
  return api('streams/' + channel);
}

export async function chatters(channel) {
  return (await r(`https://tmi.twitch.tv/group/user/${channel}/chatters`)).data;
}

export async function api(endpoint) {
  const options = {headers: {'Client-ID': '1pr5dzvymq1unqa2xiavdkvslsn4ebe'}};
  return (await r(kraken + endpoint, options)).data;
}