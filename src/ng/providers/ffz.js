/**
 * Provides an array of valid FrankerFaceZ emotes for a channel, including
 * global emotes or returns undefined if they haven't been fetched yet.
 * It's designed to be synchronous so that it can be used in filters.
 *
 * @ngdoc factory
 * @name ffz
 * @function
 *
 * @param {string} channel
 * @return {{emote: string, url: string}[]} May be empty if it hasn't been cached yet
 */
angular.module('tc').factory('ffz', function($http, channels) {
	// Using node instead of browser requests to avoid red 404 errors in the console
	var globalEmotes = [];
	var channelEmotes = {};
	var request = require('request');

	cacheGlobal();
	channels.on('add', cache);
	channels.on('remove', remove);
	channels.channels.forEach(cache);

	function cacheGlobal() {
		$http.get('http://api.frankerfacez.com/v1/set/global').success(function(data) {
			try {
				data.default_sets.forEach(function(setKey) {
					data.sets[setKey].emoticons.forEach(function(emote) {
						globalEmotes.push({
							emote: emote.name,
							url: 'http:'+emote.urls['1']
						});
					});
				});
			}
			catch(e) {console.warn('FFZ: ffz API error', e);}
			console.log('FFZ: global emotes', globalEmotes)
		});
	}

	function cache(channel) {
		channelEmotes[channel] = [];
		request('http://api.frankerfacez.com/v1/room/'+channel, function(err, response, body) {
			try {
				var data = JSON.parse(body);
				if (data.error) return;
				data.sets[data.room.set].emoticons.forEach(function (emote) {
					channelEmotes[channel].push({
						emote: emote.name,
						url: 'http:' + emote.urls['1']
					});
				});
			}
			catch(e) {console.warn('FFZ: ffz API error', e);}
			console.log('FFZ: channel emotes for '+channel, channelEmotes[channel]);
		});
	}

	function remove(channel) {
		delete channelEmotes[channel];
	}

	function get(channel) {
		return globalEmotes.concat(channelEmotes[channel] || []);
	}

	return get;
});