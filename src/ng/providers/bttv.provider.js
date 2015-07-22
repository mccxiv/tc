/**
 * Provides an array of global BTTV emotes.
 * It's designed to be synchronous so that it can be used in filters.
 *
 * @ngdoc factory
 * @name bttv
 * @function
 *
 * @return {{emote: string, url: string}[]} May be empty if it hasn't been cached yet
 */
angular.module('tc').factory('bttv', function($http) {
	var emotes = [];

	function getEmotes(delay) {
		delay = delay || 1;

		setTimeout(function() {
			$http.get('https://api.betterttv.net/emotes').success(onSuccess).error(onFail);
		}, delay);

		function onSuccess(data) {
			try {
				data.emotes.forEach(function(emote) {
					emotes.push({
						emote: emote.regex,
						url: 'http:' + emote.url
					});
				});
			}
			catch (e) {getEmotes(delay*2)}
		}

		function onFail() {
			getEmotes(delay*2);
		}
	}

	return emotes;
});