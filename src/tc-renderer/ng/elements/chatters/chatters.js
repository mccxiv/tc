import './chatters.styl'
import angular from 'angular'
import template from './chatters.pug'
import {getChattersApi} from '../../../lib/chatters'
import prettyChatterNames from '../../../lib/transforms/pretty-chatter-names'

angular.module('tc').component('chatters', {
  template,
  controller,
  bindings: {channel: '<'}
})

function controller ($http, $scope, session, store) {
  let forceShowViewers = false
  let timeout = null
  const vm = this
  vm.api = null
  vm.searchText = ''
  vm.prettyChatterNames = prettyChatterNames
  vm.showViewers = showViewers
  vm.tooManyNotDoable = tooManyNotDoable
  vm.selectUser = selectUser

  fetchList(800)
  const reFetchInterval = setInterval(fetchList, 120000)
  $scope.$watch(isChannelSelected, () => timeoutFetch(800))
  $scope.$on('$destroy', () => clearInterval(reFetchInterval))

  function showViewers (force) {
    if (typeof force === 'boolean') forceShowViewers = force
    if (!vm.api) return false
    if (vm.searchText.length > 1) return true
    if (vm.api.chatters.viewers.length < 201) return true
    else return forceShowViewers
  }

  function tooManyNotDoable () {
    if (vm.searchText.length > 1) return false // Show all if searching
    return vm.api && vm.api.chatters.viewers.length > 10000
  }

  function selectUser (username) {
    session.selectedUser = username
    session.selectedUserChannel = vm.channel
  }

  async function fetchList (attemptNumber) {
    if (!isChannelSelected()) return
    try { vm.api = await getChattersApi(vm.channel) } catch (e) {
      attemptNumber = attemptNumber || 1
      console.warn('CHATTERS: Failed to get user list. ' + attemptNumber, e)
      if (attemptNumber < 6) fetchList(attemptNumber + 1)
    }
    $scope.$digest()
  }

  function isChannelSelected () {
    const settings = store.settings.state
    return settings.channels[settings.selectedTabIndex] === vm.channel
  }

  function timeoutFetch (duration) {
    clearTimeout(timeout)
    timeout = setTimeout(fetchList, duration)
  }
}
