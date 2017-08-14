import {chatters} from './api'

const caches = {}

export function getChattersCached (channel) {
  return caches[channel] || null
}

export async function getChatters (channel) {
  if (!caches[channel]) caches[channel] = await chatters(channel)
  return caches[channel]
}