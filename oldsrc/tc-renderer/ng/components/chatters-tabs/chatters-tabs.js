import './chatters-tabs.styl'
import angular from 'angular'
import template from './chatters-tabs.pug'

angular.module('tc').component('chattersTabs', {template, controller})

function controller (settings) {
  const vm = this
  vm.settings = settings

  vm.toggleButtonClasses = () => {
    return {
      'hide-button': vm.settings.appearance.chatters,
      collapsed: !vm.settings.appearance.chatters
    }
  }
}
