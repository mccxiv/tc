import './chatters-tabs.styl'
import angular from 'angular'
import template from './chatters-tabs.pug'

angular.module('tc').component('chattersTabs', {template, controller})

function controller (store) {
  const vm = this
  vm.settings = store.settings.state
  vm.toggleButtonClasses = () => {
    return {
      'hide-button': vm.settings.appearance.chatters,
      collapsed: !vm.settings.appearance.chatters
    }
  }
}
