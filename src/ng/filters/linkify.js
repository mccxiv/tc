/**
 * @ngdoc filter
 * @name linkify
 * @type function
 *
 * @param parts {MessagePart[]}
 * @return {MessagePart[]} The returned array will be longer if it contained urls
 */
angular.module('tc').filter('linkify', function() {

  var regex = /\S*\w+\.[a-zA-Z]{2,63}\S*/;

  function makePart(string, isElement) {
    return {string: string, isElement: isElement};
  }

  function makeAnchor(url) {
    var regex = new RegExp("^(http|https)://", "i");
    var match = regex.test(url);
    var src = url;
    if (!match) src = 'http://' + url;
    return '<a href="' + src + '">' + url + '</a>';
  }

  /**
   * For each part:
   *     if there's a match:
   *         add the part before the match as a non element
   *         add the match as element
   *         isolate rest of the string
   *         repeat with rest of this string
   *     else
   *         add part as non element
   *
   *         TODO improve algorithm, recursion maybe?
   */
  return function(parts) {

    var newParts = [];

    parts.forEach(function(part) {
      if (part.isElement) {
        newParts.push(part);
        return;
      }

      var string = part.string;

      do {
        var match = regex.exec(string);

        if (match) {
          // if there's a string before the match, push it
          if (match.index > 0) {
            var before = string.substr(0, match.index);
            newParts.push(makePart(before, false));
          }
          // push the match
          newParts.push(makePart(makeAnchor(match[0]), true));
          // isolate rest of string
          string = string.substring(match.index + match[0].length);
        }
        else {
          if (string.length) newParts.push(makePart(string, false));
        }

      } while (match)
    });

    return newParts;
  }
});