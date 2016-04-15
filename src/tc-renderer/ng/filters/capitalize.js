/**
 * Capitalize the first letter in the input string
 *
 * @ngdoc filter
 * @name capitalize
 * @function
 *
 * @param {string} input
 */
angular.module('tc').filter('capitalize', function() {
  return function(input) {
    input = input || '';
    return input.charAt(0).toUpperCase() + input.slice(1);
  };
});