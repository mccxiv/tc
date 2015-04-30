/**
 * Provides helper functions for using the twitch API
 *
 * @ngdoc factory
 * @name api
 * @property {function} badges
 * @property {function} user
 */
angular.module('tc').factory('api', ['$http', function($http) {
	return {
		/**
		 * Get chat badges for a channel (subscriber icon, etc)
		 * @param {string} channel
		 * @returns {promise} As from GET /chat/:channel/badges
		 */
		badges: function(channel) {
			return this._jsonp('https://api.twitch.tv/kraken/chat/'+channel+'/badges?callback=JSON_CALLBACK');
		},

		/**
		 * Get public user object from twitch (profile picture etc)
		 * @param {string} channel
		 * @returns {promise} As from GET /users/:user
		 */
		user: function(channel) {
			return this._jsonp('https://api.twitch.tv/kraken/users/'+channel+'?callback=JSON_CALLBACK');
		},

		_jsonp: function(url) {
			return $http.jsonp(url);
		}
	}
}]);