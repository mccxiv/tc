/**
 * Returns a list of FFZ emotes for a particular channel.
 *
 * @typedef {function} getEmotes
 * @function
 * @param {string} channel
 * @return {string[]}
 */

/**
 * Provides an array of FrankerFaceZ emotes for a channel or
 * returns undefined if they haven't been fetched yet.
 * It's designed to be synchronous so that it can be used in filters.
 *
 * @ngdoc factory
 * @name ffz
 * @function
 *
 * @return {promise<getEmotes>}
 */
angular.module('tc').factory('ffz', function($http) {
	var emotes = {};
	window.ffz = get; // TODO remove

	$http.get('http://frankerfacez.com/users.txt').success(function(list) {
		emotes = txtToObj(list);
		window.emotes = emotes;
		console.log('FFZ: Fetched list, object:', emotes);
	}).error(function() {
		console.warn('FFZ: Error fetching FrankerFaceZ emotes.');
	});

	function txtToObj(txt) {
		var currentChannel;
		var arr = txt.split('\n');
		var obj = {};
		arr.forEach(function(line) {
			line = line.trim(); // otherwise Unexpected token ILLEGAL
			if (!line.length) return;
			if (line.charAt(0) !== '.') {
				currentChannel = line;
				obj[currentChannel] = [];
			}
			else {
				if (Array.isArray(obj[currentChannel])) {
					obj[currentChannel].push(line.substring(1));
				}
				else console.warn('FFZ: Malformed emotes file');
			}
		});
		return obj;
	}

	function get(channel) {
		return emotes[channel];
	}

	return get;
});