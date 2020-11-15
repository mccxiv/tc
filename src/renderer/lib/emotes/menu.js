const emotes = [
  {
    type: 'bttv-channel',
    channel: '__example_channel_1',
    label: 'BetterTTV Channel Emotes',
    emotes: []
  },
  {
    type: 'ffz-channel',
    channel: '__example_channel_1',
    label: 'FrankerFaceZ Channel Emotes',
    emotes: []
  },
  {
    type: 'bttv-global',
    label: 'BetterTTV Global',
    emotes: [
      {emote: 'Kappa', url: 'http://example.com/kappa.jpg'}
    ]
  },
  {
    type: 'ffz-global',
    label: 'FrankerFaceZ Global',
    emotes: []
  },
  {
    type: 'twitch',
    label: 'Twitch',
    emotes: []
  }
]

removeExampleValues()

export function getAllCachedEmotes (channel) {
  return emotes.filter(category => {
    if (category.channel) return category.channel === channel
    return true
  })
}

export function addBttvGlobalEmotes (arrayOfEmoteObjects) {
  emotes.find(e => e.type === 'bttv-global').emotes = arrayOfEmoteObjects
}

export function addFfzGlobalEmotes (arrayOfEmoteObjects) {
  emotes.find(e => e.type === 'ffz-global').emotes = arrayOfEmoteObjects
}

export function addFfzChannelEmotes (channel, arrayOfEmoteObjects) {
  addChannelEmotes('ffz-channel', channel, arrayOfEmoteObjects)
}

export function addBttvChannelEmotes (channel, arrayOfEmoteObjects) {
  addChannelEmotes('bttv-channel', channel, arrayOfEmoteObjects)
}

export async function addTwitchEmotesets (newEmotesetsObject) {
  const twitchEmotes = []
  Object.values(newEmotesetsObject).forEach(set => {
    set.forEach(emoteObject => {
      // Don't add it if already in the list
      if (emotes.some(({emote}) => emote === emoteObject.code)) return
      twitchEmotes.push({
        emote: emoteObject.code,
        url: `http://static-cdn.jtvnw.net/emoticons/v1/${emoteObject.id}/1.0`
      })
    })
  })
  const category = emotes.find(category => category.type === 'twitch')
  category.emotes = twitchEmotes
}

function removeExampleValues () {
  emotes[0].emotes = []
}

function channelExist (type, channel) {
  return !!emotes.find(e => e.type === type && e.channel === channel)
}

function createChannel (type, channel) {
  const beforeMap = {
    'bttv-channel': 'bttv-global',
    'ffz-channel': 'ffz-global'
  }
  const labelMap = {
    'bttv-channel': 'BetterTTV Channel Emotes',
    'ffz-channel': 'FrankerFaceZ Channel Emotes'
  }
  const label = labelMap[type]
  const before = beforeMap[type]
  const desiredInsertionIndex = emotes.findIndex(e => e.type === before) - 1
  const category = {type, label, channel, emotes: []}
  emotes.splice(desiredInsertionIndex, 0, category)
}

function addChannelEmotes (type, channel, arrayOfEmoteObjects) {
  if (!channelExist(type, channel)) createChannel(type, channel)
  const category = emotes.find(e => e.type === type && e.channel === channel)
  category.emotes = arrayOfEmoteObjects
}
