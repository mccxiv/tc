import electron from 'electron';

let checker;
eval('checker = require("spellchecker");');

export default () => {
  electron.webFrame.setSpellCheckProvider('en-US', false, {
    spellCheck: function(text) {
      return !checker.isMisspelled(text);
    }
  });
}