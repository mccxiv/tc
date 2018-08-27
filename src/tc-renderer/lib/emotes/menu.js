import {api} from '../api'

let lastEmotesetsString = ''
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

export async function addTwitchEmotesets (newEmotesetsString) {
  if (lastEmotesetsString === newEmotesetsString) return
  lastEmotesetsString = newEmotesetsString
  await fetchAndPopulateEmotesets(newEmotesetsString)
}

function removeExampleValues () {
  emotes[0].emotes = []
}

async function fetchAndPopulateEmotesets (emotesetsString) {
  try {
    const twitchEmotes = []
    const url = `chat/emoticon_images?emotesets=${emotesetsString}`
    const response = await api(url)
    Object.keys(response.emoticon_sets).forEach(setKey => {
      const set = response.emoticon_sets[setKey]
      set.forEach(emoteObject => {
        // Don't include regex based emote codes.
        // Currently all regex emotes have a / in them
        if (emoteObject.code.includes('/')) return
        twitchEmotes.push({
          emote: emoteObject.code,
          url: `http://static-cdn.jtvnw.net/emoticons/v1/${emoteObject.id}/1.0`
        })
      })
    })
    const category = emotes.find(category => category.type === 'twitch')
    category.emotes = twitchEmotes
  } catch (e) {
    console.error(e)
    // TODO retry
  }
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
