angular.module('tc').factory('openExternal', function () {
  console.log('LOAD: openExternal');
  return function (link) {
    const sh = require('shell');
    sh.openExternal(link);
  }
});