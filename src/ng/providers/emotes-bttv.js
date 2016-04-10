/**
 * Provides an array of global BTTV emotes.
 * It's designed to be synchronous so that it can be used in filters.
 *
 * @ngdoc factory
 * @name emotesBttv
 * @function
 *
 * @return {{emote: string, url: string}[]} May be empty if it hasn't been cached yet
 */
angular.module('tc').factory('emotesBttv', function ($http, channels) {
  var globalEmotes = [];
  var channelEmotes = {};

  getGlobal();
  channels.on('add', getChannelEmotes);
  channels.on('remove', removeChannelEmotes);
  channels.channels.forEach(getChannelEmotes);

  function getGlobal(delay) {
    delay = delay || 0;

    setTimeout(function () {
      $http.get('https://api.betterttv.net/emotes')
        .success(onSuccess)
        .error(onFail);
    }, delay);

    function onSuccess(data) {
      try {
        data.emotes.forEach(function (emote) {
          globalEmotes.push({
            emote: emote.regex,
            url: 'http:' + emote.url
          });
        });
      }
      catch (e) {
        onFail();
      }
    }

    function onFail() {
      getGlobal((delay || 1000) * 2);
    }
  }

  function getChannelEmotes(channel) {
    channelEmotes[channel] = [];
    var url = 'https://api.betterttv.net/2/channels/' + channel;
    $http.get(url).then(function (body) {
      try {
        var data = body.data;
        data.emotes.forEach(function (emote) {
          channelEmotes[channel].push({
            emote: emote.code,
            url: 'http://cdn.betterttv.net/emote/' + emote.id + '/1x'
          });
        });
      }
      catch (e) {console.warn('BTTV: error parsing a API call', e);}
    });
  }

  function removeChannelEmotes(channel) {
    delete channelEmotes[channel];
  }

  function get(channel) {
    return globalEmotes.concat(channelEmotes[channel] || []);
  }

  return get;
});