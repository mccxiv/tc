import angular from 'angular';
import electron from 'electron';

angular.module('tc').factory('openExternal', () => {
  return (link) => electron.shell.openExternal(link);
});