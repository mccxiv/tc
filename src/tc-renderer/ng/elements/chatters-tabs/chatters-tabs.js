import './chatters-tabs.styl'
import angular from 'angular'
import template from './chatters-tabs.pug'

angular.module('tc').directive('chattersTabs', (store) => {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    link: (scope) => {
      scope.settings = store.settings.state
      scope.hideChatters = () => {} // TODO why?
      scope.toggleButtonClasses = () => {
        return {
          'hide-button': scope.settings.appearance.chatters,
          collapsed: !scope.settings.appearance.chatters
        }
      }
    }
  }
})
