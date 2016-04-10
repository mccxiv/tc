angular.module('tc').directive('chatters', function($http, settings, session, api, channels) {

  function link(scope) {
    var forceShowViewers = false;
    var timeout = null;

    scope.api = null;

    fetchList();
    setInterval(fetchList, 120000);

    channels.on('change', function() {
      forceShowViewers = false;
      if (!scope.api) timeoutFetch(200);
      else timeoutFetch(2000);
    });

    scope.showViewers = function(force) {
      if (typeof force === 'boolean') forceShowViewers = force;
      if (!scope.api) return false;
      if (scope.api.chatters.viewers.length < 201) return true;
      else return forceShowViewers;
    };

    scope.tooManyNotDoable = function() {
      return scope.api && scope.api.chatters.viewers.length > 10000;
    };

    // TODO not DRY (same function in different files)
    scope.selectUser = function(username) {
      session.selectedUser = username;
      session.selectedUserChannel = scope.channel;
    };

    function fetchList(attemptNumber) {
      if (!isChannelSelected()) return; // Abort
      api.chatters(scope.channel).success(onList).error(function() {
        attemptNumber = attemptNumber || 0;
        attemptNumber++;
        console.warn('CHATTERS: Failed to get user list #' + attemptNumber);
        if (attemptNumber < 6) fetchList(attemptNumber);
      });
    }

    function onList(result) {
      if (result && result.data && result.data.chatters) {
        scope.api = result.data;
        var chatters = scope.api.chatters;
        scope.api.chatters = {
          staff: chatters.staff,
          admins: chatters.admins,
          global_mods: chatters.global_mods,
          moderators: chatters.moderators,
          viewers: chatters.viewers
        };
      }
      else console.warn('CHATTERS: Could not parse chatter list.');
    }

    function isChannelSelected() {
      return settings.channels[settings.selectedTabIndex] === scope.channel;
    }

    function timeoutFetch(duration) {
      clearTimeout(timeout);
      timeout = setTimeout(fetchList, duration);
    }
  }

  return {
    restrict: 'E',
    templateUrl: 'ng/elements/chatters/chatters.html',
    scope: {channel: '='},
    link: link
  }
});