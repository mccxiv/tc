angular.module('tc').factory('electron', function () {
  return {
    local: require('electron'),
    remote: require('remote').require('electron')
  }
});
