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
    channel: '__example_channel_1',
    label: 'BetterTTV Channel Emotes',
    emotes: []
  },
  {
    type: 'ffz-global',
    label: 'FrankerFaceZ Global',
    emotes: []
  },
  {
    type: 'ffz-channel',
    channel: '__example_channel_1',
    label: 'FrankerFaceZ Channel Emotes',
    emotes: []
  },
  {
    type: 'twitch-set',
    id: '0',
    label: 'Twitch set',
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

export function addTwitchEmotesets (emotesetId) {
  const t = 'twitch-set'
  const i = emotesetId
  const set = emotes.find(category => category.type === t && category.id === i)
  if (!set) createAndFetchEmoteset(emotesetId)
}

function removeExampleValues () {
  emotes[0].emotes = []
}

function createAndFetchEmoteset(emotesetId) {

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