import channels from '../channels';
import angular from 'angular';

// TODO modernize this

const $http = angular.injector(["ng"]).get("$http");

var globalEmotes = [];
var channelEmotes = {};

cacheGlobal();
channels.on('add', cache);
channels.on('remove', remove);
channels.channels.forEach(cache);

function cacheGlobal(delay) {
  delay = delay || 0;

  setTimeout(function() {
    $http.get('http://api.frankerfacez.com/v1/set/global')
      .then(onSuccess)
      .catch(onError);
  }, delay);

  function onSuccess(response) {
    response.data.default_sets.forEach(function(setKey) {
      response.data.sets[setKey].emoticons.forEach(function(emote) {
        globalEmotes.push({
          emote: emote.name,
          url: 'http:' + emote.urls['1']
        });
      });
    });
  }

  function onError() {
    cacheGlobal((delay || 1000) * 2);
  }
}

function cache(channel) {
  channelEmotes[channel] = [];
  var url = 'http://api.frankerfacez.com/v1/room/' + channel;
  $http.get(url).then(function(response) {
    var data = response.data;
    data.sets[data.room.set].emoticons.forEach(function(emote) {
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

export default function getFfzEmotes(channel) {
  return globalEmotes.concat(channelEmotes[channel] || []);
}
