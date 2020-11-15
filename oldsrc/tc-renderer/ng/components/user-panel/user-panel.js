import './user-panel.styl'
import angular from 'angular'
import template from './user-panel.pug'
import {user} from '../../../lib/api'
import { usernameToId } from '../../../lib/user-ids'

angular.module('tc').component('userPanel', {template, controller})

function controller ($scope, $document, session, irc, openExternal, settings) {
  const vm = this

  vm.$onInit = () => {
    vm.created = ''
    vm.profilePicSrc = ''
    vm.displayName = ''
    vm.amMod = amMod
    vm.shouldDisplay = shouldDisplay
    vm.goToChannel = goToChannel
    vm.sendMessage = sendMessage
    vm.whisper = whisper
    vm.ban = ban
    vm.timeout = timeout
    vm.purge = () => vm.timeout(3)
    vm.close = close

    $document.on('keypress', handleBanHotkeys)

    $scope.$watch(
      () => session.selectedUser,
      () => { if (session.selectedUser) fetchUser() }
    )
  }

  vm.$onDestroy = () => $document.off('keypress', handleBanHotkeys)

  const amMod = () => {
    const channel = settings.channels[settings.selectedTabIndex]
    return irc.isMod('#' + channel, settings.identity.username)
  }

  const indexIsInvalid = () => {
    return settings.channels.length === settings.selectedTabIndex
  }

  /**
 * True when the user was selected in the currently active channel
 * @returns {boolean}
 */
  const shouldDisplay = () => {
    if (indexIsInvalid()) return false
    const selectedChannel = settings.channels[settings.selectedTabIndex]
    const onThatChannel = session.selectedUserChannel === selectedChannel
    return session.selectedUser && onThatChannel
  }

  const goToChannel = () => {
    openExternal('http://www.twitch.tv/' + session.selectedUser)
  }

  const sendMessage = () => {
    const composeUrl = 'http://www.twitch.tv/message/compose?to='
    openExternal(composeUrl + session.selectedUser)
  }

  const whisper = () => {
    session.message = `/w ${session.selectedUser} `
    session.input.focus()
  }

  const timeout = (seconds) => {
    const toMsg = `.timeout ${session.selectedUser} ${(seconds || 600)}`
    irc.say(session.selectedUserChannel, toMsg)
    vm.close()
  }

  const ban = () => {
    const banMsg = '.ban ' + session.selectedUser
    irc.say(session.selectedUserChannel, banMsg)
    vm.close()
  }

  const close = () => {
    session.selectedUser = null
    session.selectedUserChannel = null
  }

  const fetchUser = async () => {
    const userId = await usernameToId(session.selectedUser)
    const userData = await user(userId)
    vm.displayName = userData.display_name || userData.name
    vm.profilePicSrc = userData.logo ? userData.logo : ''
    vm.created = userData.created_at
    $scope.$digest()
  }

  const handleBanHotkeys = (e) => {
    if (!session.inputFocused && vm.shouldDisplay()) {
      switch (String.fromCharCode(e.which)) {
        case 'p': return vm.purge()
        case 't': return vm.timeout()
        case 'b': return vm.ban()
      }
    }
  }
}
