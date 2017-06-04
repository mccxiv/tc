import angular from 'angular';
import settings from '../../lib/settings/settings';

angular.module('tc').factory('highlights', function() {
  return {
    /**
     * Test if a string matches any of the saved highlighted phrases.
     * @param {string} line  - Where to search for highlights.
     * @return {boolean}     - True if `line` contains a highlighted phrase.
     */
    test: function(line) {
      if (settings.highlightMe) {
        var me = new RegExp(settings.identity.username, 'i');
        if (me.test(line)) return true;
      }
      return settings.highlights.some(function(highlight) {
        var regex = new RegExp(`\\b${highlight}\\b`, 'i');
        return regex.test(line);
      });
    },

    /**
     *
     * @param {boolean} [should] - Sets the status, if provided.
     * @return {boolean} - Whether or not the user's name should be highlighted.
     */
    highlightMe: function(should) {
      if (typeof should === 'boolean') {
        settings.highlightMe = should;
      }
      return settings.highlightMe;
    },

    /**
     * Obtain a copy of the current highlight phrases.
     * @returns {string[]}
     */
    get: function() {
      return angular.copy(settings.highlights);
    },

    /**
     * Save a list of phrases as highlights.
     * Overwrites old highlights.
     * @param {string[]} highlights
     */
    set: function(highlights) {
      if (Array.isArray(highlights)) {
        settings.highlights = highlights;
      }
      else console.warn('HIGHLIGHTS: Invalid highlights provided');
    }
  }
});