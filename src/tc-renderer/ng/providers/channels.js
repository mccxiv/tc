import angular from 'angular';

/**
 * Provides and events for when channels get added
 * or removed or the selected index changes
 *
 * @ngdoc factory
 * @name channels
 *
 * @fires channels#change - When channel length or index change
 * @fires channels#add - Passes the channel that was added
 * @fires channels#remove - Passes the channel that was removed
 */
angular.module('tc').factory('channels', ($rootScope, settings) => {
  const Ee = require('events').EventEmitter;
  const ee = new Ee();
  ee.setMaxListeners(0);

  ee.channels = settings.channels;
  ee.current = currentChannel;

  $rootScope.$watchGroup(
    [
      () => settings.channels.length,
      () => settings.selectedTabIndex
    ], 
    () => ee.emit('change')
  );

  $rootScope.$watchCollection(
    () => settings.channels,
    (newValue, oldValue) => {
      const added = _.difference(newValue, oldValue);
      const removed = _.difference(oldValue, newValue);

      if (added.length) {
        added.forEach((channel) => ee.emit('add', channel));
      }

      if (removed.length) {
        removed.forEach((channel) => ee.emit('remove', channel));
      }
    }
  );

  function currentChannel() {
    return settings.channels[settings.selectedTabIndex];
  }

  return ee;
});