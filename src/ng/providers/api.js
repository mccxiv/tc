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
     * @returns {Promise} As from GET /chat/:channel/badges
     */
    badges: function(channel) {
      var FfzDonorBadge = 'https://cdn.frankerfacez.com/script/devicon.png';
      var jsonp = this._jsonp;

      return new Promise(function(resolve, reject) {
        jsonp('https://api.twitch.tv/kraken/chat/' + channel + '/badges?callback=JSON_CALLBACK')
          .then(function(result) {
            result.data['ffz_donor'] = {image: FfzDonorBadge};
            resolve(result.data);
          })
          .catch(reject);
      });
    },

    /**
     * Get public user object from twitch (profile picture etc)
     * @param {string} channel
     * @returns {Promise} As from GET /users/:user
     */
    user: function(channel) {
      return this._jsonp('https://api.twitch.tv/kraken/users/' + channel + '?callback=JSON_CALLBACK');
    },

    /**
     * Get public channel object from twitch (profile picture etc)
     * @param {string} channel
     * @returns {Promise} As from GET /channels/:channel
     */
    channel: function(channel) {
      return this._jsonp('https://api.twitch.tv/kraken/channels/' + channel + '?callback=JSON_CALLBACK');
    },

    /**
     * Get public stream object from twitch (live viewers etc)
     * @param {string} channel
     * @returns {Promise} As from GET /streams/:channel
     */
    stream: function(channel) {
      return this._jsonp('https://api.twitch.tv/kraken/streams/' + channel + '?callback=JSON_CALLBACK');
    },

    /**
     * Get a list of accounts connected to a channel's chat
     * @param {string} channel
     * @returns {Promise} As from GET /streams/:channel
     */
    chatters: function(channel) {
      return this._jsonp('https://tmi.twitch.tv/group/user/' + channel + '/chatters?callback=JSON_CALLBACK');
    },

    _jsonp: function(url) {
      return $http.jsonp(url);
    }
  }
}]);