import angular from 'angular';
import ngMaterial from 'angular-material';
import ngSanitize from 'angular-sanitize';
import settings from '../lib/settings/settings';
import 'angular-material/angular-material.css';

angular.module('tc', [ngMaterial, ngSanitize]);

angular.module('tc').controller('main', ($scope, session, irc) => {
  $scope.session = session;
  $scope.settings = settings;

  $scope.needLogin = () => {
    return !irc.credentialsValid() || irc.badLogin;
  };

  $scope.expanded = () => {
    return !settings.appearance.sidebarCollapsed;
  };

  $scope.showingThumbnail = () => {
    return $scope.expanded() && settings.appearance.thumbnail;
  };
});

/** Load stuff */
angular.module('tc').run(function(
  messages, notifications, zoomManager, autoUpdater, trayIcon) {
});