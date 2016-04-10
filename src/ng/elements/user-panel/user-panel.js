angular.module('tc').directive('userPanel', function($document, settings, session, irc, api, openExternal) {

  function link(scope) {
    scope.m = {
      created: '',
      profilePicSrc: ''
    };

    $document.bind('keypress', function(e) {
      if (!session.inputFocused && scope.shouldDisplay()) {
        var character = String.fromCharCode(e.which);
        switch (character) {
          case 'p':
            scope.purge();
            break;
          case 't':
            scope.timeout();
            break;
          case 'b':
            scope.ban();
            break;
        }
      }
    });

    scope.$watch(
      function() {
        return session.selectedUser;
      },
      function() {
        if (session.selectedUser) fetchUser();
      }
    );

    scope.amMod = function() {
      var channel = settings.channels[settings.selectedTabIndex];
      return irc.isMod(channel, settings.identity.username);
    };

    /**
     * True when the user was selected in the currently active channel
     * @returns {boolean}
     */
    scope.shouldDisplay = function() {
      var selectedChannel = settings.channels[settings.selectedTabIndex];
      var onThatChannel = session.selectedUserChannel === selectedChannel;
      return session.selectedUser && onThatChannel;
    };

    scope.goToChannel = function() {
      openExternal('http://www.twitch.tv/' + session.selectedUser);
    };

    scope.sendMessage = function() {
      var composeUrl = 'http://www.twitch.tv/message/compose?to=';
      openExternal(composeUrl + session.selectedUser);
    };

    scope.timeout = function(seconds) {
      seconds = seconds || 600;
      var toMsg = '.timeout ' + session.selectedUser + ' ' + seconds;
      irc.say(session.selectedUserChannel, toMsg);
      scope.close();
    };

    scope.purge = function() {
      scope.timeout(3);
    };

    scope.ban = function() {
      var banMsg = '.ban ' + session.selectedUser;
      irc.say(session.selectedUserChannel, banMsg);
      scope.close();
    };

    scope.close = function() {
      session.selectedUser = null;
      session.selectedUserChannel = null;
    };

    function fetchUser() {
      api.user(session.selectedUser).success(function(user) {
        scope.m.profilePicSrc = user.logo ? user.logo : '';
        scope.m.created = user.created_at;
      });
    }
  }

  return {
    restrict: 'E',
    templateUrl: 'ng/elements/user-panel/user-panel.html',
    link: link
  }
});