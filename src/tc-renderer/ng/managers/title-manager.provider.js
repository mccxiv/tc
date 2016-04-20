import angular from 'angular';
import channels from '../../lib/channels';
import settings from '../../lib/settings/settings';

/**
 * Manages the window title :)
 *
 * @ngdoc factory
 * @name titleManager
 */
angular.module('tc').factory('titleManager', function($filter) {

  var capitalize = $filter('capitalize');

  channels.on('change', function() {
    var prefix;
    var suffix = ' - Tc';
    var channel = settings.channels[settings.selectedTabIndex];
    if (channel) prefix = capitalize(channel);
    else prefix = 'Join channel';
    document.title = prefix + suffix;
  });

  return null;
});