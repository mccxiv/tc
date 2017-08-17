import {chatters} from './api'

const chattersFromApi = {
  'example-channel-name-1': [
    'username1'
  ]
}
const activeChatters = {
  'example-channel-name-1': {
    'username1': 12345 // timestamp of last message
  }
}

// TODO listen to messages or read messages log to populate activeChatters

export async function getChattersApi (channel) {
  const apiResponse = await chatters(channel)
  createChannelState(channel)
  populateChattersListFromApi(channel, apiResponse)
  removeInactiveChatters(channel)
  return apiResponse
}

export function getChatterNames (channel) {
  createChannelState(channel)
  const activeChatterNames = Object.keys(activeChatters[channel])
  const apiChatterNames = chattersFromApi[channel]
  new Set([...activeChatterNames, ...apiChatterNames])
}

function populateChattersListFromApi(channel, apiResponse) {
  chattersFromApi[channel] = Object.keys(apiResponse.chatters)
    .map(key => apiResponse.chatters[key])
    .reduce((acc, curr) => [...acc, ...curr])
}

function removeInactiveChatters (channel) {
  const activeChatterNames = Object.keys(activeChatters[channel])
  const apiChatterNames = chattersFromApi[channel]
  const now = Date.now()
  const _30minutes = 1000 * 60 * 30
  const _30minutesAgo = now - _30minutes
  activeChatterNames.forEach(chatter => {
    if (apiChatterNames.includes(chatter)) return
    const lastMessage = activeChatters[channel][chatter]
    if (lastMessage < _30minutesAgo) delete activeChatters[channel][chatter]
  })
}

function createChannelState (channel) {
  if (!activeChatters[channel]) activeChatters[channel] = {}
}