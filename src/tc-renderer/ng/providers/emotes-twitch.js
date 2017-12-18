import _ from 'lodash'
import {api} from '../../lib/api'
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
  var emotes = []

  irc.once('emotesets', function (sets) {
    addTwitchEmotesets(sets)
    getEmotes()

    async function getEmotes () {
      try {
        const images = await api('chat/emoticon_images?emotesets=' + sets)
        onSuccess(images)
      }
      catch (e) {
        onFail()
      }

      function onSuccess (data) {
        try {
          _.each(data.emoticon_sets, function (set) {
            set.forEach(function (emoteObject) {
              // Don't include regex based emote codes.
              // Currently all regex emotes have a / in them
              if (contains(emoteObject.code, '/')) return
              emotes.push({emote: emoteObject.code, id: emoteObject.id})
            })
          })
        }
        catch (e) {
          console.error(e)
          onFail()
        }
      }

      function onFail () {
        console.warn('Error grabbing twitch emotes. Retrying in 1m.')
        setTimeout(getEmotes, 60000)
      }
    }
  })

  function contains (string, contains) {
    return string.indexOf(contains) > -1
  }

  return emotes
})
