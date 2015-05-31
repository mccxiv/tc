
/**
 * @ngdoc filter
 * @name bttvmotes
 * @type function
 *
 * @param parts {MessagePart[]}
 * @return {MessagePart[]}
 */
angular.module('tc').filter('bttvmotes', function(bttv) {
	var potentialEmoteRegex = /[a-zA-Z_]{3,}/g;

	function makePart(string, isElement) {
		return {string: string, isElement: isElement};
	}

	function isEmote(emote, emotes) {
		return !!_.find(emotes, 'emote', emote);
	}

	function makeEmote(url) {
		return '<img class="emoticon" src="'+url+'">';
	}

	return function(parts) {

		var emotes = bttv;
		var newParts = [];

		parts.forEach(function(part) {
			if (part.isElement) {
				newParts.push(part);
				return;
			}

			var endIndexOfPreviousEmote = 0;
			var string = part.string;
			var match;

			while ((match = potentialEmoteRegex.exec(string)) !== null) {
				// TODO refactor inefficient algorithm
				if (isEmote(match[0], emotes)) {
					console.log('BTTVMOTES: Emote found', match[0]);

					// Save previous bit as a non emote
					if (match.index > endIndexOfPreviousEmote) {
						var before = string.substr(endIndexOfPreviousEmote, match.index);
						add(before, false);
					}

					// Save emote as tag
					var img = makeEmote(_.find(emotes, 'emote', match[0]).url);
					add(img, true);

					// Track progress through string
					endIndexOfPreviousEmote = match.lastIndex;
				}
			}

			// Check if there's string left over after the last emote, add it
			if (endIndexOfPreviousEmote < string.length) {
				add(string.substring(endIndexOfPreviousEmote), false);
			}
		});

		/** Helper */
		function add(string, isElement) {
			newParts.push(makePart(string, isElement));
		}

		return newParts;
	}
});