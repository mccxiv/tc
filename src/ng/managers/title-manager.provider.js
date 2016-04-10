/**
 * Manages the window title :)
 *
 * @ngdoc factory
 * @name titleManager
 */
angular.module('tc').factory('titleManager', function ($filter, channels, settings) {

  var capitalize = $filter('capitalize');

  channels.on('change', function () {
    var prefix;
    var suffix = ' - Tc';
    var channel = settings.channels[settings.selectedTabIndex];
    if (channel) prefix = capitalize(channel);
    else prefix = 'Join channel';
    document.title = prefix + suffix;
  });

  return null;
});