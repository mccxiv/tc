import key from 'keymaster';
import settings from '../settings/settings';

key.filter = () => true;

function registerShortcuts() {
  key('⌘+n, ctrl+n', goToAddChannel);
  key('⌘+tab, ctrl+tab', nextTab);
}

function nextTab() {
  const newIndex = settings.selectedTabIndex + 1;
  if (newIndex >= settings.channels.length) settings.selectedTabIndex = 0;
  else settings.selectedTabIndex = newIndex
}

function goToAddChannel() {
  settings.selectedTabIndex = settings.channels.length;
}

export default registerShortcuts;