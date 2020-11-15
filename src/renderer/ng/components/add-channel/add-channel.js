import './add-channel.styl'
import angular from 'angular'
import template from './add-channel.pug'
import {ipcRenderer as ipc} from 'electron'

angular.module('tc').component('addChannel', {template, controller})

function controller (settings, $mdToast) {
  const vm = this
  vm.value = ''
  vm.keypress = e => e.which === 13 ? joinChannel(vm.value) : null

  function joinChannel (channel) {
    channel = channel.trim()
    if (!channel.length) return
    channel = channel.toLowerCase()
    if (settings.channels.includes(channel)) {
      $mdToast.showSimple('You\'re already in this channel')
    } else {
      settings.channels.push(channel)
      vm.value = ''
    }
  }

  // TODO memory leak, should unregister on $destroy
  // TODO this probably doesn't work here? Shouldn't it be in an init task
  ipc.on('join-channel', (event, channel) => {
    joinChannel(channel)
  })
}
