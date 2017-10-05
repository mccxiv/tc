import {apiv5, usernameToId} from '../api'
import channels from '../channels';

const state = {
  global: [],
  channels: {'example-channel-1': []},
  ids: {'example-channel-1': '12345'}
}

const getters = {
  cheerPrefixes (channel) {
    const actions = getters.actions(channel)
    return actions.map(a => a.prefix.toLowerCase())
  },

  actions (channel) {
    const global = state.global || []
    const current = state.channels[channel] || []
    return current.length ? current : global
  }
}

fetchBitsConfig();
channels.on('add', fetchBitsConfig);
channels.on('remove', cleanup);
channels.channels.forEach(fetchBitsConfig);

async function fetchBitsConfig(channel) {
  if (!state.ids[channel]) state.ids[channel] = await usernameToId(channel)
  const channelArgs = channel ? `?channel_id=${state.ids[channel]}` : ''
  const response = await apiv5(`bits/actions${channelArgs}`)
  if (channel) state.channels[channel] = response.actions
  else state.global = response.actions
}

function cleanup (channel) {
  delete state.channels[channel]
  delete state.ids[channel]
}

function makeImg (channel, cheer) {
  let tier
  const actions = getters.actions(channel)
  const [, prefix, digit] = /(\D+)(\d+)/.exec(cheer)
  const amount = Number(digit)
  const action = actions.find(a => a.prefix.toLowerCase() === prefix)
  if (!action) return cheer
  action.tiers.forEach(t => {if (amount >= t.min_bits) tier = t})
  // TODO use the correct theme from settings
  const imagePaths = [
    'images.light.animated.1',
    'images.dark.animated.1',
    'images.light.static.1',
    'images.dark.static.1'
  ]
  const urls = imagePaths.map(path => deepGet(tier, path))
  const firstValidUrl = urls.find(url => !!url)
  const meta = `data-emote-name="${cheer}" alt="${cheer}"`
  return `<img class="emoticon" ${meta} src="${firstValidUrl}">${digit}`

  function deepGet(obj, path) {
    const parts = path.split(".")
    if (parts.length === 1) return obj[parts[0]]
    return deepGet(obj[parts[0]], parts.slice(1).join("."))
  }
}

export default function addBitGifs (channel, message) {
  const prefixes = getters.cheerPrefixes(channel)
  const words = message.split(' ')
  const converted = words.map(word => {
    const endsWithNumber = /\d+$/.test(word)
    if (!endsWithNumber) return word
    const prefix = prefixes.find(prefix => word.startsWith(prefix))
    if (!prefix) return word
    return makeImg(channel, word)
  })
  return converted.join(' ')
}
