/**
 * Escape HTML. eg: < becomes &lt;
 * It is destructive, the original array is modified and returned
 * @ngdoc filter
 * @name escape
 * @type function
 *
 * @param parts {string | MessagePart[]} Elements will not be escaped, only text strings
 * @return {MessagePart[]}
 */
angular.module('tc').filter('escape', function() {

  function escape(html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return function(parts) {
    if (typeof parts === 'string') return escape(parts);
    parts.forEach(function(part) {
      if (part.isElement) return;
      part.string = escape(part.string);
    });
    return parts;
  }
});