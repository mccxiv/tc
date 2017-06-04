import key from 'keymaster';
import settings from '../settings/settings';

key.filter = () => true;

function registerShortcuts() {
  key('⌘+n, ctrl+n', goToAddChannel);
  key('⌘+tab, ctrl+tab', nextTab);
  key('⌘+shift+tab, ctrl+shift+tab', previousTab);
  key('⌘+shift+left, ctrl+shift+left', previousTab);
  key('⌘+shift+right, ctrl+shift+right', nextTab);
  key('⌘+s, ctrl+s', toggleSidebar);
  key('tab', focusInput);

  for(let i = 1; i < 10; i++) {
    key(`⌘+${i}, ctrl+${i}`, () => tab(i));
  }
}

function tab(index) {
  if (index <= settings.channels.length) settings.selectedTabIndex = index - 1;
}

function toggleSidebar() {
  const a = settings.appearance;
  a.sidebarCollapsed = !a.sidebarCollapsed;
}

function focusInput() {
  const isChannelTab = settings.selectedTabIndex < settings.channels.length;
  if (isChannelTab) focus('#main-input');
  else focus('#join-channel-input');
}

function focus(id) {
  const mainInput = document.querySelector(id);
  const active = document.activeElement;
  if (active.tagName !== 'INPUT' && active !== mainInput) {
    setTimeout(() => mainInput.focus(), 20); // Doesn't work without timeout
  }
}

function nextTab() {
  const newIndex = settings.selectedTabIndex + 1;
  if (newIndex >= settings.channels.length) settings.selectedTabIndex = 0;
  else settings.selectedTabIndex = newIndex;
}

function previousTab() {
  const newIndex = settings.selectedTabIndex - 1;
  if (newIndex < 0) settings.selectedTabIndex = settings.channels.length - 1;
  else settings.selectedTabIndex = newIndex;
}

function goToAddChannel() {
  settings.selectedTabIndex = settings.channels.length;
}

export default registerShortcuts;