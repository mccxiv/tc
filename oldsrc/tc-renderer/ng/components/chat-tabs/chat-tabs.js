import './chat-tabs.styl'
import angular from 'angular'
import template from './chat-tabs.pug'
import channels from '../../../lib/channels'
import * as api from '../../../lib/api'
import * as R from 'ramda'

angular.module('tc').component('chatTabs', {template, controller})

function controller ($scope, $timeout, messages, settings) {
  const vm = this

  vm.$onInit = () => {
    vm.streams = {}
    vm.hotkey = process.platform === 'darwin' ? '⌘' : 'ctrl'
    vm.settings = settings
    vm.loaded = []
    vm.readUntil = {}
    vm.getStreamsInterval = setInterval(getStreams, 60000)

    vm.unread = numberOfUnreadMessages
    vm.showingAddChannel = isAddTabSelected
    vm.moveLeft = moveLeft
    vm.moveRight = moveRight
    vm.live = liveStreamType
    vm.isLoaded = isLoaded

    loadCurrentChannel()
    getStreams()
    channels.on('change', getStreams)

    $scope.$watchCollection(
      currChannel,
      R.pipe(loadCurrentChannel, unloadNonCurrentChannelsDelayed)
    )
  }

  vm.$onDestroy = () => clearInterval(vm.getStreamsInterval)

  const loadCurrentChannel = () => {
    vm.loaded = R.pipe(R.append(currChannel()), R.uniq)(vm.loaded)
  }

  function unloadNonCurrentChannelsDelayed () {
    R.pipe(
      R.without(currChannel()),
      R.map(
        R.pipe(
          R.tap(unloadInThreeSeconds),
          R.tap(countUnreadMessages)
        )
      )
    )(vm.loaded)
  }

  function unloadInThreeSeconds (channel) {
    $timeout(() => {
      if (currChannel() !== channel) {
        vm.loaded = R.without(channel, vm.loaded)
      }
    }, 3000)
  }

  function moveLeft ($event, channel) {
    moveTab($event, channel, -1)
  }

  function moveRight ($event, channel) {
    moveTab($event, channel, 1)
  }

  function moveTab ($event, channel, positionChange) {
    const index = settings.channels.indexOf(channel)
    const newIndex = index + positionChange
    arrayMove(settings.channels, index, newIndex)
    $event.stopPropagation()
    $event.preventDefault()
  }

  function isLoaded (channel) {
    return R.contains(channel, vm.loaded)
  }

  /**
   * Returns how many unread messages a channel has.
   * @param channel
   * @returns {string|number}
   */
  function numberOfUnreadMessages (channel) {
    if (currChannel() === channel) return ''
    let unread = messages(channel).counter - (vm.readUntil[channel] || 0)
    if (!unread) return ''
    if (unread > 100) return '*'
    else return unread
  }

  function isAddTabSelected () {
    return settings.selectedTabIndex === settings.channels.length
  }

  function countUnreadMessages (channel) {
    const lines = messages(channel)
    if (lines) vm.readUntil[channel] = lines.counter
    else delete vm.readUntil[channel] // Channel was left
  }

  function currChannel () {
    return isAddTabSelected()
      ? 'add-new'
      : settings.channels[settings.selectedTabIndex]
  }

  function arrayMove (arr, fromIndex, toIndex) {
    const element = arr[fromIndex]
    arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, element)
  }

  async function getStreams () {
    for (const channel of settings.channels) {
      vm.streams[channel] = await api.stream(channel)
    }
  }

  function liveStreamType (channel) {
    if (!vm.streams[channel] || !vm.streams[channel].stream) return null
    return vm.streams[channel].stream.stream_type
  }
}
