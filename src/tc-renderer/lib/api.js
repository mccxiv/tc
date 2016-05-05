import r from 'axios';

const kraken = 'https://api.twitch.tv/kraken/';

export async function badges(channel) {
  const badges = await api(`/chat/${channel}/badges`);
  badges['ffz_donor'] = {};
  badges['ffz_donor'].image = 'https://cdn.frankerfacez.com/script/devicon.png';
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