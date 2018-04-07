import r from 'axios'
import {sleep, mergeDeep} from './util'
import {CLIENT_ID} from './constants'

const kraken = 'https://api.twitch.tv/kraken/'

export async function badges (channel) {
  try {
    const userId = (await user(channel))._id
    const base = 'https://badges.twitch.tv/v1/badges/'
    const globalUrl = base + 'global/display?language=en'
    const channelUrl = base + `channels/${userId}/display?language=en`
    const globalBadges = (await r(globalUrl)).data
    const channelBadges = (await r(channelUrl)).data
    const globalBitBadges = (globalBadges.badge_sets || {}).bits
    const channelBitBadges = (channelBadges.badge_sets || {}).bits
    const mergedBitBadges = mergeDeep(globalBitBadges, channelBitBadges)
    return {
      ...globalBadges.badge_sets,
      ...channelBadges.badge_sets,
      ...{bits: mergedBitBadges}
    }
  } catch (e) {
    await sleep(3000)
    return badges(channel)
  }
}

export async function user (channel) {
  return api('users/' + channel)
}

export async function channel (channel) {
  return api('channels/' + channel)
}

export async function stream (channel) {
  return api('streams/' + channel)
}

export async function chatters (channel) {
  return (await r(`https://tmi.twitch.tv/group/user/${channel}/chatters`)).data
}

export async function api (endpoint) {
  const options = {headers: {'Client-ID': CLIENT_ID}}
  return (await r(kraken + endpoint, options)).data
}

export async function usernameToId (username) {
  try {
    const response = await apiv5(`users?login=${username}`)
    return response.users[0]._id
  } catch (e) {
    return null
  }
}

export async function apiv5 (endpoint) {
  const options = {
    headers: {
      'Client-ID': CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json'
    }
  }
  return (await r(kraken + endpoint, options)).data
}
