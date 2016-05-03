import angular from 'angular';
import ngMaterial from 'angular-material';
import ngSanitize from 'angular-sanitize';
import settings from '../lib/settings/settings';
import 'angular-material/angular-material.css';

const app = angular.module('tc', [ngMaterial, ngSanitize]);

app.controller('main', ($scope, session, irc) => {
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

/** Eagerly load stuff */
app.run((messages, notifications) => {});

app.config(($compileProvider) => $compileProvider.debugInfoEnabled(false));