/**
 * Forces providers to instantiate
 */
angular.module('tc').run(function(electron) {
  var checker = require('spellchecker');
  electron.local.webFrame.setSpellCheckProvider('en-US', false, {
    spellCheck: function(text) {
      return !checker.isMisspelled(text);
    }
  });
});