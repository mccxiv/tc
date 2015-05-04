/**
 * Provides methods to get, set and test for highlight phrases.
 *
 * @ngdoc factory
 * @name highlights

 */
angular.module('tc').factory('highlights', function(settings, settingsGui) {

	settingsGui.addItem('Highlights', '<highlights-options></highlights-options>');

	return {

		/**
		 * Test if a string matches any of the saved highlighted phrases.
		 * @param {string} line  - Where to search for highlights.
		 * @return {boolean}     - True if `line` contains a highlighted phrase.
		 */
		test: function(line) {
			var me = new RegExp(settings.identity.username, 'i');
			if (me.test(line)) return true;
			return settings.highlights.some(function (highlight) {
				var regex = new RegExp(highlight, 'i');
				return regex.test(line);
			});
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