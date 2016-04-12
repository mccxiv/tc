import angular from 'angular';

/**
 * @ngdoc filter
 * @name bttvfy
 * @type function
 *
 * @param parts {MessagePart[]}
 * @return {MessagePart[]}
 */
angular.module('tc').filter('bttvfy', (emotesBttv, _) => {
  var potentialEmoteRegex = /[^\s]+/g;

  function isEmote(emote, emotes) {
    return !!emotes.find((e) => e.emote === emote);
  }

  function makeEmote(url, emote) {
    return '<img class="emoticon" data-emote-name="' + emote + '" data-emote-description="BTTV Emote" src="' + url + '">';
  }

  return (channel, parts) => {

    var emotes = emotesBttv(channel);
    var newParts = [];

    parts.forEach((part) => {

      // if it's not plain text, ignore this bit
      if (part.isElement) {
        newParts.push(part);
        return;
      }

      let endIndexOfPreviousEmote = 0;
      const string = part.string;
      let match;

      // for each character sequence that could potentially be a string
      while ((match = potentialEmoteRegex.exec(string)) !== null) {
        // TODO refactor inefficient algorithm

        // if it's indeed an emote
        if (isEmote(match[0], emotes)) {

          console.log('apparently its an emote');

          // Save previous bit as a non emote
          if (match.index > endIndexOfPreviousEmote) {
            const before = string.substring(endIndexOfPreviousEmote, match.index);
            add(before, false);
          }

          // Save emote as tag element
          const img = makeEmote(_.find(emotes, 'emote', match[0]).url, match[0]);
          add(img, true);

          // Track progress through string
          endIndexOfPreviousEmote = potentialEmoteRegex.lastIndex;
        }
      }

      // Check if there's string left over after the last emote, add it
      if (endIndexOfPreviousEmote < string.length) {
        add(string.substring(endIndexOfPreviousEmote), false);
      }
    });

    /** Helper */
    function add(string, isElement) {
      newParts.push({string, isElement});
    }

    return newParts;
  }
});