/**
 * @ngdoc filter
 * @name emotify
 * @kind function
 *
 * @param message {string}
 * @param emotes {Object.<string, string[]>} The user.emote object, as provided by `twitch-irc`
 * @return {MessagePart[]}
 */
angular.module('tc').filter('emotify', function() {

  /**
   * Internal documentation
   *
   * 1) Re-organize the emotes in new format
   * 2) Sort by beginIndex, greatest to smallest
   * 3) For each occurrence
   *        3.1) escape and store substring from emote end to end of `line` in `output`
   *        3.2) store the emote in `output` array
   *        3.3) store substring from 0 to emote start in `line`
   * 4) escape and store `line` in `output`
   * 5) reverse `output`
   *
   * New format: [ [(string)id, (int)beginIndex, (int)endIndex] ]
   *
   * Eg.
   * [
   *   ['2197', 19, 24],
   *   ['16720', 7, 17],
   *   ['2197', 0, 5]
   * ]
   *
   */

  function imgEmote(id, emote) {
    return '<img class="emoticon " data-emote-name="' + emote + '" src="http://static-cdn.jtvnw.net/emoticons/v1/' + id + '/1.0">';
  }

  function makePart(string, isElement) {
    return {string: string, isElement: isElement};
  }

  return function(message, emotes) {
    emotes = emotes || {};
    var line = message || '';
    var occurrences = [];
    var output = [];

    // 1
    Object.keys(emotes).forEach(function(emoteKey) {
      emotes[emoteKey].forEach(function(occurrence) {
        var indexes = occurrence.split('-');
        if (indexes.length === 2) {
          occurrences.push([emoteKey, Number(indexes[0]), Number(indexes[1])]);
        }
      });
    });

    // 2
    occurrences.sort(function(a, b) {
      if (a[1] < b[1]) return -1;
      if (a[1] > b[1]) return 1;
      return 0;
    });
    occurrences.reverse();

    // 3
    occurrences.forEach(function(occurrence) {
      var prev, emote;
      // +1 because occurrence[2] is the position of the last character
      // not the position of the character after the last
      emote = line.substring(occurrence[1], occurrence[2] + 1);
      prev = line.substring(occurrence[2] + 1);
      if (prev) output.push(makePart(prev, false)); // 3.1
      output.push(makePart(imgEmote(occurrence[0], emote), true)); // 3.2
      line = line.substring(0, occurrence[1]); //3.3
    });

    if (line) output.push(makePart(line, false)); // 4
    output.reverse(); // 5
    return output;
  };
});