
/**
 * @ngdoc filter
 * @name ffzfy
 * @type function
 *
 * @param parts {MessagePart[]}
 * @return {MessagePart[]}
 */
angular.module('tc').filter('ffzfy', function(ffz) {
	var potentialEmoteRegex = /[a-zA-Z_]{3,}/g;

	function makePart(string, isElement) {
		return {string: string, isElement: isElement};
	}

	function isEmote(emote, emotes) {
		return emotes.indexOf(emote) > -1;
	}

	function makeEmote(channel, emote) {
		return '<img class="emoticon" src="http://cdn.frankerfacez.com/channel/'+channel+'/'+emote+'.png">';
	}

	return function(channel, parts) {

		var emotes = ffz(channel);
		if (!emotes) return parts;
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
				if (isEmote(match[0], emotes)) {
					console.log('FFZFY: Emote found', match[0]);

					// Save previous bit as a non emote
					if (match.index > endIndexOfPreviousEmote) {
						var before = string.substr(endIndexOfPreviousEmote, match.index);
						add(before, false);
					}

					// Save emote as tag
					var img = makeEmote(channel, match[0]);
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