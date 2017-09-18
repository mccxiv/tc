const emotes = [
  {
    type: 'bttv-global',
    label: 'BetterTTV Global',
    emotes: [
      {code: 'Kappa', url: 'http://example.com/kappa.jpg'}
    ]
  },
  {
    type: 'bttv-channel',
    channel: '__example',
    label: 'BetterTTV Channel Emotes',
    emotes: [
      {code: 'Keepo', url: 'http://example.com/keepo.jpg'}
    ]
  },
  {
    type: 'ffz-global',
    label: 'FrankerFaceZ Global',
    emotes: []
  },
  {
    type: 'ffz-channel',
    channel: '__example',
    label: 'FrankerFaceZ Channel Emotes',
    emotes: []
  },
  {
    type: 'twitch-all',
    label: 'FrankerFaceZ Channel Emotes',
    emotes: []
  },
]

removeExampleValues()

export function getAllCachedEmotes () {

}

export function addBttvGlobalEmotes (arrayOfEmoteObjects) {
  emotes.find(e => e.type === 'bttv-global').emotes = arrayOfEmoteObjects
}

export function addFfzGlobalEmotes (arrayOfEmoteObjects) {
  emotes.find(e => e.type === 'ffz-global').emotes = arrayOfEmoteObjects
}

export function addFfzChannelEmotes(channel, arrayOfEmoteObjects) {
  addChannelEmotes('ffz-channel', channel, arrayOfEmoteObjects)
}

export function addBttvChannelEmotes(channel, arrayOfEmoteObjects) {
  addChannelEmotes('bttv-channel', channel, arrayOfEmoteObjects)
}

export function addTwitchEmoteSets (emotesetArray) {
  
}

function removeExampleValues () {
  emotes.forEach(emoteCategory => emoteCategory.emotes = [])
}

function channelExist (type, channel) {
  return !!emotes.find(e => e.type === type && e.channel === channel)
}

function createChannel (type, channel) {
  const afterMap = {
    'bttv-channel': 'bttv-global',
    'ffz-channel': 'ffz-global'
  }
  const labelMap = {
    'bttv-channel': 'BetterTTV Channel Emotes',
    'ffz-channel': 'FrankerFaceZ Channel Emotes'
  }
  const label = labelMap[type]
  const after = afterMap[type]
  const desiredInsertionIndex = emotes.findIndex(e => e.type === after) + 1
  const category = {type, label, channel, emotes: []}
  emotes.splice(desiredInsertionIndex, 0, category)
}

function addChannelEmotes (type, channel, arrayOfEmoteObjects) {
  if (!channelExist(type, channel)) createChannel(type)
  const category = emotes.find(e => e.type === type && e.channel === channel)
  category.emotes = arrayOfEmoteObjects
}