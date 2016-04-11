import electron from 'electron';
import checker from 'spellchecker';

export default () => {
  electron.local.webFrame.setSpellCheckProvider('en-US', false, {
    spellCheck: function(text) {
      return !checker.isMisspelled(text);
    }
  });
}