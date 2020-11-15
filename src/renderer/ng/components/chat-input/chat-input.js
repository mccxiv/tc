import './chat-input.styl'
import angular from 'angular'
import template from './chat-input.pug'
import replacePhrases from '../../../lib/transforms/replace-phrases'
import {getChatterNames} from '../../../lib/chatters'
import emotesFfz from '../../../lib/emotes/ffz'
import emotesBttv from '../../../lib/emotes/bttv'

angular.module('tc').component('chatInput', {template, controller})

// eslint-disable-next-line
function controller ($scope, $element, session, irc, messages, emotesTwitch, settings) {
  const vm = this
  let lastWhisperer
  const input = $element.find('input')[0]

  vm.$onInit = () => {
    vm.emoteMenu = false
    vm.session = session
    vm.irc = irc
    vm.chatHistory = []
    session.input = input // TODO make a better system

    closeEmoteMenuOnEscape()
    irc.on('whisper', listenToWhispers)
  }

  vm.$onDestroy = () => {
    irc.removeListener('whisper', listenToWhispers)
    window.removeEventListener('keyup', keyupHandlerCloseEmoteMenu)
  }

  vm.getAutoCompleteStrings = () => {
    const channel = settings.channels[settings.selectedTabIndex]
    if (!channel) return []

    const names = getChatterNames(channel)
    const atNames = names.map(name => '@' + name)
    const bttvEmotes = grabEmotes(emotesBttv(channel)).sort()
    const ffzEmotes = grabEmotes(emotesFfz(channel)).sort()
    const twitchEmotes = grabEmotes(emotesTwitch).sort()
    return [].concat(twitchEmotes, bttvEmotes, ffzEmotes, names, atNames)

    function grabEmotes (arr) {
      return arr.map((e) => e.emote)
    }
  }

  vm.input = () => {
    if (vm.emoteMenu) vm.emoteMenu = false
    const channel = settings.channels[settings.selectedTabIndex]
    if (!channel || !session.message.trim().length) return

    if (session.message.charAt(0) === '/') {
      session.message = '.' + session.message.substr(1)
    }

    if (session.message.indexOf('.w') === 0) {
      const words = session.message.split(' ')
      const username = words[1]
      const message = words.slice(2).join(' ')
      irc.whisper(username, message)
      messages.addWhisper(settings.identity.username, username, message)
    } else irc.say(channel, session.message)
    if (vm.chatHistory.indexOf(session.message) !== -1) {
      vm.chatHistory.splice(
        vm.chatHistory.indexOf(session.message),
        1
      )
    }
    vm.chatHistory.unshift(session.message)
    session.message = ''
  }

  vm.keyUp = (event) => {
    const keyCode = event.keyCode || event.which
    const historyIndex = vm.chatHistory.indexOf(session.message)
    if (keyCode === 38) {
      if (historyIndex >= 0) {
        if (vm.chatHistory[historyIndex + 1]) {
          session.message = vm.chatHistory[historyIndex + 1]
        }
      } else {
        if (session.message !== '') {
          vm.chatHistory.unshift(session.message)
          session.message = vm.chatHistory[1]
        } else {
          session.message = vm.chatHistory[0]
        }
      }
    } else if (keyCode === 40) {
      if (historyIndex >= 0) {
        if (vm.chatHistory[historyIndex - 1]) {
          session.message = vm.chatHistory[historyIndex - 1]
        } else {
          session.message = ''
        }
      }
    }
  }

  vm.change = function () {
    const msg = session.message
    if (msg === '/r ') {
      if (lastWhisperer) session.message = `/w ${lastWhisperer} `
      else session.message = '/w '
    } else if (msg.startsWith('/') || msg.endsWith(':')) {
      session.message = replacePhrases(msg)
    }
  }

  vm.toggleEmoteMenu = function () {
    vm.emoteMenu = !vm.emoteMenu
  }

  function listenToWhispers (from) {
    lastWhisperer = from.startsWith('#') ? from.substring(1) : from
  }

  function closeEmoteMenuOnEscape () {
    window.addEventListener('keyup', keyupHandlerCloseEmoteMenu)
  }

  function keyupHandlerCloseEmoteMenu (e) {
    if (e.keyCode === 27 && vm.emoteMenu) {
      vm.emoteMenu = false
      $scope.$digest()
    }
  }
}
