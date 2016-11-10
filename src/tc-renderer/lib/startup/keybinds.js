import key from 'keymaster';
import settings from '../settings/settings';

function registerShortcuts() {
  key('⌘+n, ctrl+n', goToAddChannel);
}

function goToAddChannel() {
  settings.selectedTabIndex = settings.channels.length;
}

export default registerShortcuts;