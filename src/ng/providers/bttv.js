/**
 * Provides an array of BTTV emotes.
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
	var request = require('request');

	$http.get('https://api.betterttv.net/emotes').success(function(data) {
		try {
			data.emotes.forEach(function(emote) {
				emotes.push({
					emote: emote.regex,
					url: 'http:' + emote.url
				});
			});
		}
		catch (e) {console.warn('FFZ: ffz API error', e);}
	});

	return emotes;
});