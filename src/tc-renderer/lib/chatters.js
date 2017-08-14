import {chatters} from './api'

const caches = {}

export default async function (channel, refresh) {
  if (refresh) caches[channel] = chatters(channel)
  if (!caches[channel]) caches[channel] = chatters(channel)
  return await caches[channel]
}