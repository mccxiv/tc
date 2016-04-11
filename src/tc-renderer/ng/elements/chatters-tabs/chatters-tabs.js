import './chatters-tabs.css';
import angular from 'angular';
import template from './chatters-tabs.html';

angular.module('tc').directive('chattersTabs', ['settings', function(settings) {
  return {
    restrict: 'E',
    template: template,
    link: function(scope) {
      scope.settings = settings;
      scope.hideChatters = function() {} // TODO why?
    }
  }
}]);