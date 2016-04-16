import r from 'request-promise';

const kraken = 'https://api.twitch.tv/kraken/';

export async function badges(channel) {
  const badges = await r(`${kraken}/chat/${channel}/badges`);
  badges['ffz_donor'] = {};
  badges['ffz_donor'].image = 'https://cdn.frankerfacez.com/script/devicon.png';
  return badges;
}

export async function user(channel) {
  return r(kraken + 'users/' + channel);
}

export async function channel(channel) {
  return r(kraken + 'channels/' + channel);
}

export async function stream(channel) {
  return r(kraken + 'streams/' + channel);
}

export async function chatters(channel) {
  return r('https://tmi.twitch.tv/group/user/' + channel);
}