import './chat-input.styl'
import angular from 'angular'
import template from './chat-input.pug'
import replacePhrases from '../../../lib/transforms/replace-phrases'
import {getChatterNames} from '../../../lib/chatters'
import settings from '../../../lib/settings/settings'
import emotesFfz from '../../../lib/emotes/ffz'
import emotesBttv from '../../../lib/emotes/bttv'

angular.module('tc').directive('chatInput',
  (session, irc, messages, emotesTwitch) => {
    function link (scope, element) {
      scope.m = {emoteMenu: false}
      scope.session = session
      scope.irc = irc
      scope.chatHistory = []
      const input = element.find('input')[0]
      session.input = input // TODO make a better system
      let lastWhisperer

      closeEmoteMenuOnEscape()

      irc.on('whisper', from => {
        lastWhisperer = from.startsWith('#') ? from.substring(1) : from
      })

      scope.getAutoCompleteStrings = () => {
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

      scope.input = () => {
        if (scope.m.emoteMenu) scope.m.emoteMenu = false
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
        if (scope.chatHistory.indexOf(session.message) !== -1) {
          scope.chatHistory.splice(
            scope.chatHistory.indexOf(session.message),
            1
          )
        }
        scope.chatHistory.unshift(session.message)
        session.message = ''
      }

      scope.keyUp = (event) => {
        const keyCode = event.keyCode || event.which
        const historyIndex = scope.chatHistory.indexOf(session.message)
        if (keyCode === 38) {
          if (historyIndex >= 0) {
            if (scope.chatHistory[historyIndex + 1]) {
              session.message = scope.chatHistory[historyIndex + 1]
            }
          } else {
            if (session.message !== '') {
              scope.chatHistory.unshift(session.message)
              session.message = scope.chatHistory[1]
            } else {
              session.message = scope.chatHistory[0]
            }
          }
        } else if (keyCode === 40) {
          if (historyIndex >= 0) {
            if (scope.chatHistory[historyIndex - 1]) {
              session.message = scope.chatHistory[historyIndex - 1]
            } else {
              session.message = ''
            }
          }
        }
      }

      scope.change = function () {
        const msg = session.message
        if (msg === '/r ') {
          if (lastWhisperer) session.message = `/w ${lastWhisperer} `
          else session.message = '/w '
        } else if (msg.startsWith('/') || msg.endsWith(':')) {
          session.message = replacePhrases(msg)
        }
      }

      scope.toggleEmoteMenu = function () {
        scope.m.emoteMenu = !scope.m.emoteMenu
      }

      function closeEmoteMenuOnEscape () {
        window.addEventListener('keyup', keyupHandlerCloseEmoteMenu)

        scope.$on('$destroy', () => {
          window.removeEventListener('keyup', keyupHandlerCloseEmoteMenu)
        })

        function keyupHandlerCloseEmoteMenu (e) {
          if (e.keyCode === 27 && scope.m.emoteMenu) {
            scope.m.emoteMenu = false
            scope.$apply()
          }
        }
      }
    }

    return {restrict: 'E', template, link}
  })
