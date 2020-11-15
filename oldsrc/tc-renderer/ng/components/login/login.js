import './login.styl'
import angular from 'angular'
import template from './login.pug'

angular.module('tc').component('login', {template, controller})

function controller (irc, openExternal, settings) {
  const vm = this

  vm.$onInit = () => {
    vm.irc = irc
    vm.settings = settings

    // Do not bind username and password directly to the store or
    // it will break the form's conditionals - according to past me
    vm.username = settings.identity.username
    vm.password = settings.identity.password

    vm.haveUsername = !!settings.identity.username.length
    vm.haveNoPassword = !settings.identity.password.length

    vm.login = login
    vm.trimPassword = () => vm.password = vm.password.trim()
    vm.doesntLookLikeToken = doesntLookLikeToken
    vm.generate = () => openExternal('http://gettc.xyz/password/')
  }

  function login () {
    settings.identity.username = vm.username.trim()
    settings.identity.password = vm.password.trim()
  }

  function doesntLookLikeToken () {
    return !!(vm.password && !vm.password.startsWith('oauth'))
  }
}
