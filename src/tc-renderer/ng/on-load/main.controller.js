import angular from 'angular';
import settings from '../../lib/settings/settings';

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