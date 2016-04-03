/**
 * Forces providers to instantiate
 */
angular.module('tc').run(function (electron) {
  console.log('SPELLCHECK: Spell checker has been temporarily disabled.');

  if (process.platform === 'win32') return; // TODO fix on windows.
  
  var checker = require('spellchecker');
  electron.local.webFrame.setSpellCheckProvider('en-US', false, {
    spellCheck: function (text) {
      return !checker.isMisspelled(text);
    }
  });
});