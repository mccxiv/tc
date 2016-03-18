/**
 * Provides an array of available Twitch emotes
 * It's designed to be synchronous so that it can be used in filters.
 * Return value does not include regex based emotes, which are the classic
 * smiley faces like :-) and :/.
 *
 * @ngdoc factory
 * @name emotesTwitch
 * @function
 *
 * @return {{emote: string}[]} May be empty if it hasn't been cached yet
 */
angular.module('tc').factory('emotesTwitch', function($http, irc) {
	console.log('LOAD: emotesTwitch');
	var emotes = [];

	irc.on('emotesets', function(sets) {
		console.log('EMOTES-TWITCH: got emote-sets', sets);
		var url = 'https://api.twitch.tv/kraken/chat/emoticon_images';
		url += '?emotesets='+sets;

		getEmotes();

		function getEmotes() {
			$http.get(url).success(onSuccess).error(onFail);

			function onSuccess(data) {
				try {
					_.each(data.emoticon_sets, function(set) {
						set.forEach(function(emoteObject) {
							// Don't include regex based emote codes.
							// Currently all regex emotes have a / in them
							if (contains(emoteObject.code, '/')) return;
							emotes.push({emote: emoteObject.code})
						});
					});
				}
				catch (e) {onFail();}
			}

			function onFail() {
				console.warn('Error grabbing twitch emotes. Retrying in 1m.');
				setTimeout(getEmotes, 60000);
			}
		}
	});

	function contains(string, contains) {
		return string.indexOf(contains) > -1;
	}

	return emotes;
});