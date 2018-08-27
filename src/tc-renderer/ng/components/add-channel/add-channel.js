import './add-channel.styl'
import angular from 'angular'
import template from './add-channel.pug'
import {ipcRenderer as ipc} from 'electron'

angular.module('tc').component('addChannel', {template, controller})

function controller (settings) {
  const vm = this
  vm.value = ''
  vm.keypress = (event) => {
    if (event.which === 13) {
      let channel = vm.value.trim()
      channel = channel.toLowerCase()
      if (channel.length && settings.channels.indexOf(channel) < 0) {
        settings.channels.push(channel)
        vm.value = ''
      }
      // TODO give user feedback if invalid, but only on enter
    }
  }

  // TODO memory leak, should unregister on $destroy
  ipc.on('join-channel', function (event, channel) {
    channel = channel.trim()
    channel = channel.toLowerCase()
    if (channel.length && settings.channels.indexOf(channel) < 0) {
      settings.channels.push(channel)
    }
  })
}
