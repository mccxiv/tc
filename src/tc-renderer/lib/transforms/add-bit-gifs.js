import {apiv5} from '../api'

let config = {};

fetchBitsConfig();

async function fetchBitsConfig() {
  config = await apiv5('bits/actions')
}

function getCheerPrefixes () {
  return (config.actions || []).map(a => a.prefix.toLowerCase())
}

function makeImg (cheer) {
  let tier
  const [, prefix, digit] = /(\D+)(\d+)/.exec(cheer)
  const amount = Number(digit)
  const action = config.actions.find(a => a.prefix.toLowerCase() === prefix)
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

export default function addBitGifs (message) {
  const prefixes = getCheerPrefixes()
  const words = message.split(' ')
  const converted = words.map(word => {
    const endsWithNumber = /\d+$/.test(word)
    if (!endsWithNumber) return word
    const prefix = prefixes.find(prefix => word.startsWith(prefix))
    if (!prefix) return word
    return makeImg(word)
  })
  return converted.join(' ')
}
