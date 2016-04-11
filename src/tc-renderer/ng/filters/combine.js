/**
 * Combines message parts into a single string
 * @ngdoc filter
 * @name combine
 * @type function
 *
 * @param parts {MessagePart[]}
 * @return string
 */
angular.module('tc').filter('combine', function() {

  return function(parts) {
    var strings = [];
    parts.forEach(function(part) {
      strings.push(part.string);
    });
    return strings.join('');
  }
});