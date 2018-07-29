import './chat-tabs.styl'
import $ from 'jquery'
import angular from 'angular'
import template from './chat-tabs.pug'
import settings from '../../../lib/settings/settings'
import channels from '../../../lib/channels'
import * as api from '../../../lib/api'

angular.module('tc').directive('chatTabs', ($timeout, messages) => {
  function link (scope, element) {
    const getStreamsInterval = setInterval(getStreams, 60000)
    element = $(element[0])

    scope.m = {
      streams: {},
      hotkey: process.platform === 'darwin' ? '⌘' : 'ctrl'
    }
    scope.settings = settings
    scope.hidden = {}
    scope.loaded = {}
    scope.readUntil = {}
    element.attr('layout', 'column')

    scope.selected = (channel) => load(channel, true)
    scope.deselected = handleChannelDeselected
    scope.unread = numberOfUnreadMessages
    scope.showingAddChannel = isAddTabSelected
    scope.moveLeft = moveLeft
    scope.moveRight = moveRight
    scope.live = liveStreamType

    scope.$on('$destroy', cleanup)

    if (currChannel()) scope.loaded[currChannel()] = true

    getStreams()

    channels.on('change', () => {
      getStreams()
    })

    // TODO remove hack. When joining a new channel it won't render unless...
    channels.on('add', () => {
      setTimeout(() => clickTab(settings.channels.length), 10)
      setTimeout(() => clickTab(settings.channels.length - 1), 200)
    })

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

    function clickTab (index) {
      element.find('md-tab-item').eq(index).click()
    }

    /**
     * Returns how many unread messages a channel has.
     * @param channel
     * @returns {string|number}
     */
    function numberOfUnreadMessages (channel) {
      if (currChannel() === channel) return ''
      let unread = messages(channel).counter - (scope.readUntil[channel] || 0)
      if (!unread) return ''
      if (unread > 100) return '*'
      else return unread
    }

    function isAddTabSelected () {
      return settings.selectedTabIndex === settings.channels.length
    }

    function handleChannelDeselected (channel) {
      const lines = messages(channel)
      load(channel, false)
      hideTemporarily(channel)
      if (lines) scope.readUntil[channel] = lines.counter
      else delete scope.readUntil[channel] // Channel was left
    }

    /**
     * The chat-output directive should not be shown and hidden immediately
     * because it's a very CPU intensive operation, let the animations
     * run first then do the heavy DOM manipulation.
     * @param {string} channel
     * @param {boolean} show
     */
    function load (channel, show) {
      // $timeout(loadSync, show? 1000 : 3000);
      loadSync()

      function loadSync () {
        // Abort unload operation if the tab to be hidden is selected again
        if (currChannel() === channel && !show) return
        if (show) scope.loaded[channel] = true
        else {
          $timeout(() => {
            if (currChannel() !== channel) {
              delete scope.loaded[channel]
            }
          }, 3000)
        }
      }
    }

    /**
     * Hide the exiting channel first, then remove it from DOM.
     * Removing it immediately uses too much CPU
     * @param {string} channel
     */
    function hideTemporarily (channel) {
      scope.hidden[channel] = true
      $timeout(() => delete scope.hidden[channel], 1500)
    }

    function currChannel () {
      return settings.channels[settings.selectedTabIndex]
    }

    function arrayMove (arr, fromIndex, toIndex) {
      const element = arr[fromIndex]
      arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, element)
    }

    async function getStreams() {
      for (const channel of settings.channels) {
        scope.m.streams[channel] = await api.stream(channel)
      }
    }

    function liveStreamType(channel) {
      if (
        !scope.m.streams[channel] ||
        !scope.m.streams[channel].stream
      ) return null

      return scope.m.streams[channel].stream.stream_type
    }

    function cleanup() {
      clearInterval(getStreamsInterval)
    }
  }

  return {restrict: 'E', scope: {}, template, link}
})
