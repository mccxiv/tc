/**
 * Forces providers to instantiate
 */
angular.module('tc').run(function () {
  var checker = require('spellchecker');
  require('web-frame').setSpellCheckProvider('en-US', false, {
    spellCheck: function (text) {
      return !checker.isMisspelled(text);
    }
  });
});