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
	console.log('LOAD: bttv');
	var emotes = [];

	getEmotes();

	function getEmotes(delay) {
		delay = delay || 0;

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
			catch (e) {onFail();}
		}

		function onFail() {
			getEmotes((delay || 1000) * 2);
		}
	}

	return emotes;
});