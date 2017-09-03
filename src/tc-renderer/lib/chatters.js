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

let chatListener

export async function getChattersApi (channel) {
  if (!chatListener) bootStrapChatListener()
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
  const minutes = 1000 * 60 * 10
  const minutesAgo = now - minutes
  activeChatterNames.forEach(chatter => {
    if (apiChatterNames.includes(chatter)) return
    const lastMessage = activeChatters[channel][chatter]
    if (lastMessage < minutesAgo) delete activeChatters[channel][chatter]
  })
}

function createChannelState (channel) {
  if (!activeChatters[channel]) activeChatters[channel] = {}
}

function bootStrapChatListener () {
  const rootAppElement = document.querySelector('[ng-app]');
  const irc = angular.element(rootAppElement).injector().get('irc')

  chatListener = irc.on('chat', (channel, userObject) => {
    if (channel.startsWith('#')) channel = channel.slice(1)
    else console.warn('Hmm... Looks like the channel didn\'t start with #')
    activeChatters[channel] = activeChatters[channel] || {}
    activeChatters[channel][userObject.username] = Date.now()
  })
}