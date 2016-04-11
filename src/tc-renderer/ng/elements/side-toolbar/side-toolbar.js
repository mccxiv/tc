import './side-toolbar.css';
import angular from 'angular';
import template from './side-toolbar.html';

angular.module('tc').directive('sideToolbar', function(settings, settingsGui, $filter, $mdDialog, irc, openExternal, autoUpdater) {

  function link(scope, element) {
    scope.m = {};
    scope.irc = irc;
    scope.settings = settings;
    scope.settingsGui = settingsGui;
    element.attr('layout', 'row');

    // Monkey patch for broken ng-class.
    // See issue #174
    scope.$watch(function() {
      return irc.ready;
    }, function() {
      var el = element[0].querySelector('.connection');
      if (!irc.ready) el.classList.add('not-ready');
      else el.classList.remove('not-ready');
    });

    autoUpdater.on('update-downloaded', function() {
      scope.m.updateAvailable = true;
      scope.$apply();
    });

    scope.channel = function() {
      return settings.channels[settings.selectedTabIndex]
    };

    scope.confirmLogout = function(event) {
      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .content('Are you sure you want to log out? ' +
          'You will need to re-enter your password.')
        .ok('OK')
        .cancel('Cancel')
        .targetEvent(event);
      confirm._options.clickOutsideToClose = true;

      $mdDialog.show(confirm).then(
        function() {
          settings.identity.password = '';
        },
        function() {
        }
      );
    };

    scope.leave = function() {
      settings.channels.splice(settings.selectedTabIndex, 1);
      // TODO call $apply?
    };

    scope.openChannel = function() {
      openExternal('http://www.twitch.tv/' + scope.channel());
    };

    scope.toggleCollapsed = function() {
      settings.appearance.sidebarCollapsed = !settings.appearance.sidebarCollapsed;
    };

    scope.showingThumbnailButton = function() {
      return scope.channel() && !settings.appearance.thumbnail;
    };
  }

  return {
    restrict: 'E',
    template: template,
    link: link
  }
});