import './chatters-tabs.css'
import angular from 'angular'
import template from './chatters-tabs.html'
import settings from '../../../lib/settings/settings'

angular.module('tc').directive('chattersTabs', () => {
  return {
    restrict: 'E',
    template: template,
    link: (scope) => {
      scope.settings = settings
      scope.hideChatters = () => {} // TODO why?
    }
  }
})
