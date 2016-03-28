angular.module('tc').factory('manifest', function () {
  return require('./package.json');
});