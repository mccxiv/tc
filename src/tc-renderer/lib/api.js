import r from 'axios'
import {mergeDeep} from './util'
import {CLIENT_ID} from './constants'

export async function badges (channel) {
  const userId = await usernameToId(channel)
  const base = 'https://badges.twitch.tv/v1/badges/'
  const globalUrl = base + 'global/display?language=en'
  const channelUrl = base + `channels/${userId}/display?language=en`
  const globalBadges = await api(globalUrl)
  const channelBadges = await api(channelUrl)
  const globalBitBadges = (globalBadges.badge_sets || {}).bits
  const channelBitBadges = (channelBadges.badge_sets || {}).bits
  const mergedBitBadges = mergeDeep(globalBitBadges, channelBitBadges)
  return {
    ...globalBadges.badge_sets,
    ...channelBadges.badge_sets,
    ...{bits: mergedBitBadges}
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
  const options = {
    headers: {
      'Client-ID': CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json'
    }
  }
  const absolute = endpoint.startsWith('https://')
  const url = absolute ? endpoint : `https://api.twitch.tv/kraken/${endpoint}`
  return (await r(url, options)).data
}

export async function usernameToId (username) {
  try {
    const response = await api(`users?login=${username}`)
    return response.users[0]._id
  } catch (e) {
    return null
  }
}
