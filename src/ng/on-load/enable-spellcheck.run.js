
/**
 * Forces providers to instantiate
 */
angular.module('tc').run(function() {
	var checker = require('spellchecker');
	require('web-frame').setSpellCheckProvider('en-US', true, {
		spellCheck: function (text) {
			return !checker.isMisspelled(text);
		}
	});
});