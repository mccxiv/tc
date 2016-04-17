import r from 'axios';

const kraken = 'https://api.twitch.tv/kraken/';

export async function badges(channel) {
  const badges = (await r(`${kraken}/chat/${channel}/badges`)).data;
  badges['ffz_donor'] = {};
  badges['ffz_donor'].image = 'https://cdn.frankerfacez.com/script/devicon.png';
  return badges;
}

export async function user(channel) {
  return (await r(kraken + 'users/' + channel)).data;
}

export async function channel(channel) {
  return (await r(kraken + 'channels/' + channel)).data;
}

export async function stream(channel) {
  return (await r(kraken + 'streams/' + channel)).data;
}

export async function chatters(channel) {
  return (await r(`https://tmi.twitch.tv/group/user/${channel}/chatters`)).data;
}