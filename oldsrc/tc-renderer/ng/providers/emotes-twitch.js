import angular from 'angular'
import {addTwitchEmotesets} from '../../lib/emotes/menu'

/**
 * Provides an array of available Twitch emotes
 * It's designed to be synchronous so that it can be used in filters.
 * Return value does not include regex based emotes, which are the classic
 * smiley faces like :-) and :/.
 *
 * @ngdoc factory
 * @name emotesTwitch
 * @function
 *
 * @return {{emote: string}[]} May be empty if it hasn't been cached yet
 */
angular.module('tc').factory('emotesTwitch', function (irc) {
  const emotes = []

  irc.on('emotesets', function (setsString, setsObject) {
    addTwitchEmotesets(setsObject)

    Object.values(setsObject).forEach(set => {
      set.forEach(emoteObject => {
        // Don't include regex based emote codes.
        // Currently all regex emotes have a / in them
        if (contains(emoteObject.code, '/')) return
        // Don't add it if already in the list
        if (emotes.some(({emote}) => emote === emoteObject.code)) return
        emotes.push({emote: emoteObject.code, id: emoteObject.id})
      })
    })
  })

  function contains (string, contains) {
    return string.indexOf(contains) > -1
  }

  return emotes
})
