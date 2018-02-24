import './add-channel.css'
import angular from 'angular'
import template from './add-channel.html'
import settings from '../../../lib/settings/settings'
var ipc = require('electron').ipcRenderer

angular.module('tc').directive('addChannel', () => {
  function link (scope) {
    scope.value = ''
    scope.keypress = (event) => {
      if (event.which === 13) {
        let channel = scope.value.trim()
        channel = channel.toLowerCase()
        if (channel.length && settings.channels.indexOf(channel) < 0) {
          settings.channels.push(channel)
          scope.value = ''
        }
        // TODO give user feedback if invalid, but only on enter
      }
    }
  }

  ipc.on('join-channel', function (event, channel) {
      channel = channel.trim()
      channel = channel.toLowerCase()
      if (channel.length && settings.channels.indexOf(channel) < 0) {
          settings.channels.push(channel)
      }
  })

  return {restrict: 'E', template, link}
})
