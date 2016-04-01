/**
 * Forces providers to instantiate
 */
angular.module('tc').run(function () {
  console.log('SPELLCHECK: Spell checker has been temporarily disabled.');
  // Because it's a headache to build

  /*var checker = require('spellchecker');
  require('web-frame').setSpellCheckProvider('en-US', false, {
    spellCheck: function (text) {
      return !checker.isMisspelled(text);
    }
  });*/
});