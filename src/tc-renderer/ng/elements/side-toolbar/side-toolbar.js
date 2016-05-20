import './side-toolbar.css';
import angular from 'angular';
import template from './side-toolbar.html';
import settings from '../../../lib/settings/settings';
import capitalize from '../../../lib/transforms/capitalize';
import autoUpdater from '../../../lib/auto-updater';

angular.module('tc').directive('sideToolbar',
  (settingsGui, $mdDialog, irc, openExternal) => {

  function link(scope, element) {
    scope.m = {};
    scope.irc = irc;
    scope.settings = settings;
    scope.settingsGui = settingsGui;
    element.attr('layout', 'row');

    // Monkey patch for broken ng-class.
    // See issue #174
    scope.$watch(
      () => irc.ready,
      () => {
        var el = element[0].querySelector('.connection');
        if (!irc.ready) el.classList.add('not-ready');
        else el.classList.remove('not-ready');
      }
    );

    autoUpdater.on('update-downloaded', () => {
      scope.m.updateAvailable = true;
      scope.$apply();
    });

    scope.capitalize = capitalize;
    
    scope.channel = () => settings.channels[settings.selectedTabIndex];

    scope.confirmLogout = (event) => {
      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .content('Are you sure you want to log out? ' +
          'You will need to re-enter your password.')
        .ok('OK')
        .cancel('Cancel')
        .targetEvent(event);
      confirm._options.clickOutsideToClose = true;
      $mdDialog.show(confirm).then(() => settings.identity.password = '');
    };

    scope.leave = () => {
      settings.channels.splice(settings.selectedTabIndex, 1);
    };

    scope.openChannel = () => {
      openExternal('http://www.twitch.tv/' + scope.channel());
    };

    scope.restart = () => autoUpdater.quitAndInstall();

    scope.toggleCollapsed = () => {
      settings.appearance.sidebarCollapsed = !settings.appearance.sidebarCollapsed;
    };

    scope.showingThumbnailButton = () => {
      return scope.channel() && !settings.appearance.thumbnail;
    };
  }

  return {restrict: 'E', template, link}
});