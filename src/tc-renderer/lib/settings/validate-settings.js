import defaults from './default-settings';
import angular from 'angular';

export default (settings) => {
  let s = settings;
  // TODO this whole thing is dumb, needs refactor

  if (!angular.isObject(s)) s = angular.copy(defaults);

  if (!angular.isObject(s.identity)) s.identity = angular.copy(defaults.identity);
  if (!angular.isString(s.identity.username)) s.identity.username = defaults.identity.username;
  if (!angular.isString(s.identity.password)) s.identity.password = defaults.identity.password;

  if (!angular.isObject(s.notifications)) s.notifications = angular.copy(defaults.notifications);
  if (typeof s.notifications.onConnect !== 'boolean') s.notifications.onConnect = defaults.notifications.onConnect;
  if (typeof s.notifications.onMention !== 'boolean') s.notifications.onMention = defaults.notifications.onMention;
  if (typeof s.notifications.onWhisper !== 'boolean') s.notifications.onWhisper = defaults.notifications.onWhisper;
  if (typeof s.notifications.soundOnMention !== 'boolean') s.notifications.soundOnMention = defaults.notifications.soundOnMention;

  if (!angular.isObject(s.chat)) s.chat = angular.copy(defaults.chat);
  if (typeof s.chat.timestamps !== 'boolean') s.chat.timestamps = defaults.chat.timestamps;
  if (!angular.isArray(s.chat.ignored)) s.chat.ignored = defaults.chat.ignored;

  if (!angular.isNumber(s.selectedTabIndex)) s.selectedTabIndex = defaults.selectedTabIndex;
  if (!angular.isArray(s.channels)) s.channels = angular.copy(defaults.channels);
  if (!angular.isArray(s.highlights)) s.highlights = angular.copy(defaults.highlights);
  if (typeof s.highlightMe !== 'boolean') s.highlightMe = defaults.highlightMe;

  if (!angular.isObject(s.theme)) s.theme = angular.copy(defaults.theme);
  if (typeof s.theme.dark !== 'boolean') s.theme.dark = defaults.theme.dark;

  if (!angular.isObject(s.appearance)) s.appearance = angular.copy(defaults.appearance);
  if (!angular.isNumber(s.appearance.zoom)) s.appearance.zoom = defaults.appearance.zoom;
  if (typeof s.appearance.thumbnail !== 'boolean') s.appearance.thumbnail = defaults.appearance.thumbnail;
  if (typeof s.appearance.simpleViewerCount !== 'boolean') s.appearance.simpleViewerCount = defaults.appearance.simpleViewerCount;
  if (typeof s.appearance.sidebarCollapsed !== 'boolean') s.appearance.sidebarCollapsed = defaults.appearance.sidebarCollapsed;
  if (typeof s.appearance.chatters !== 'boolean') s.appearance.chatters = defaults.appearance.chatters;
  if (typeof s.appearance.split !== 'boolean') s.appearance.split = defaults.appearance.split;
  if (typeof s.appearance.variableLineHeight !== 'boolean') s.appearance.variableLineHeight = defaults.appearance.variableLineHeight;
  if (typeof s.appearance.hideTimeouts !== 'boolean') s.appearance.hideTimeouts = defaults.appearance.hideTimeouts;

  if (!angular.isObject(s.behavior)) s.behavior = angular.copy(defaults.behavior);
  if (typeof s.behavior.autoStart !== 'boolean') s.behavior.autoStart = angular.copy(defaults.behavior.autoStart);
  
  if (!angular.isObject(s.shortcuts)) s.shortcuts = angular.copy(defaults.shortcuts);

  return s;
}
