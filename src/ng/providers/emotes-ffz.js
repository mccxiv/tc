/**
 * Provides an array of valid FrankerFaceZ emotes for a channel, including
 * global emotes or returns undefined if they haven't been fetched yet.
 * It's designed to be synchronous so that it can be used in filters.
 *
 * @ngdoc factory
 * @name emotesFfz
 * @function
 *
 * @param {string} channel
 * @return {{emote: string, url: string}[]} May be empty if it hasn't been cached yet
 */
angular.module('tc').factory('emotesFfz', function ($http, channels) {
  console.log('LOAD: emotesFfz');

  var globalEmotes = [];
  var channelEmotes = {};

  cacheGlobal();
  channels.on('add', cache);
  channels.on('remove', remove);
  channels.channels.forEach(cache);

  function cacheGlobal(delay) {
    delay = delay || 0;

    setTimeout(function () {
      $http.get('http://api.frankerfacez.com/v1/set/global')
        .then(onSuccess)
        .catch(onError);
    }, delay);

    function onSuccess(response) {
      response.data.default_sets.forEach(function (setKey) {
        response.data.sets[setKey].emoticons.forEach(function (emote) {
          globalEmotes.push({
            emote: emote.name,
            url: 'http:' + emote.urls['1']
          });
        });
      });
      console.log('FFZ: global emotes', globalEmotes);
    }

    function onError() {
      cacheGlobal((delay || 1000) * 2);
    }
  }

  function cache(channel) {
    channelEmotes[channel] = [];
    var url = 'http://api.frankerfacez.com/v1/room/' + channel;
    $http.get(url).then(function (response) {
      var data = response.data;
      data.sets[data.room.set].emoticons.forEach(function (emote) {
        channelEmotes[channel].push({
          emote: emote.name,
          url: 'http:' + emote.urls['1']
        });
      });
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