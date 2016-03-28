/**
 * Renders a channel's messages
 *
 * @ngdoc directive
 * @name chatOutput
 * @restrict E
 */
angular.module('tc').directive('chatOutput', function ($sce, $timeout, settings, messages, session, irc, api, openExternal) {

  function link(scope, element) {
    //===============================================================
    // Variables
    //===============================================================
    var latestScrollWasAutomatic = false;
    var e = element[0];
    scope.opts = settings.chat;
    scope.badges = null;
    scope.messages = messages(scope.channel);
    scope.chatLimit = -scope.opts.maxChatLines;
    scope.autoScroll = true;

    //===============================================================
    // Setup
    //===============================================================
    watchScroll();
    fetchBadges();
    handleAnchorClicks();
    hideUnscrolledLines();
    handleEmoteHover();
    delayedScroll();

    console.log('CHAT-OUTPUT: loading ' + scope.channel);

    scope.$watch(
      function () {
        return scope.messages[scope.messages.length - 1]
      },
      function () {
        if (scope.autoScroll) scrollDown();
        else scope.chatLimit--; // ng-repeat uses negative
      }
    );

    scope.$watch(
      function () {
        return settings.appearance.sidebarCollapsed
      },
      function () {
        setTimeout(scrollIfEnabled, 260);
      }
    );

    window.addEventListener('resize', scrollIfEnabled);


    //===============================================================
    // Directive methods
    //===============================================================
    scope.selectUsername = function (username) {
      console.log('CHAT-OUTPUT: Username selected:', username);
      session.selectedUser = username;
      session.selectedUserChannel = scope.channel;
    };

    scope.isBroadcaster = function (username) {
      return username.toLowerCase() === scope.channel.toLowerCase();
    };

    scope.trusted = function (html) {
      return $sce.trustAsHtml(html);
    };

    scope.scrollDown = scrollDown;

    //===============================================================
    // Functions
    //===============================================================
    function delayedScroll() {
      setTimeout(scrollIfEnabled, 300);
      setTimeout(scrollIfEnabled, 600);
      setTimeout(scrollIfEnabled, 1200);
      setTimeout(scrollIfEnabled, 2400);
    }

    function handleEmoteHover() {
      element.on('mouseenter', '.emoticon', function (e) {
        var emoticon = $(e.target);
        var tooltip = emoticon.data('emote-name');
        var description = emoticon.data('emote-description');

        if (description) tooltip += '<br>' + description;
        emoticon.frosty({html: true, content: tooltip});
        emoticon.frosty('show');
        emoticon.one('mouseleave', function () {
          emoticon.frosty('hide');
        })
      });
    }

    /**
     * Turns autoscroll on and off based on user scrolling,
     * resets the max lines when autoscroll is turned back on,
     * shows all lines when scrolling up to the top (infinite scroll)
     */
    function watchScroll() {
      element.on('scroll', function () {
        if (!latestScrollWasAutomatic) {
          scope.autoScroll = distanceFromBottom() === 0;
          scope.$apply();
        }
        latestScrollWasAutomatic = false; // Reset it
        if (scope.autoScroll) scope.chatLimit = -scope.opts.maxChatLines;
        else if (distanceFromTop() === 0) showAllLines();
      });
    }

    /**
     * Causes ng-repeat to load all chat lines.
     * Makes sure the scrollbar doesn't jump to the
     * top when the new lines are added.
     */
    function showAllLines() {
      $timeout(function () {
        var dfb = distanceFromBottom();
        scope.chatLimit = Infinity;
        $timeout(function () {
          e.scrollTop = e.scrollHeight - (dfb + e.offsetHeight);
        });
      }, 30);
    }

    function scrollIfEnabled() {
      if (scope.autoScroll) scrollDown();
    }

    function scrollDown() {
      scope.autoScroll = true;
      latestScrollWasAutomatic = true;
      setTimeout(function () {
        console.log('CHAT-OUTPUT: scrolling down automatically');
        e.scrollTop = e.scrollHeight;
      }, 0);
    }

    function hideUnscrolledLines() {
      element.css({'opacity': 0});
      setTimeout(function () {
        element.css({'opacity': 1});
      }, 0);
    }

    function distanceFromTop() {
      return Math.floor(e.scrollTop);
    }

    function distanceFromBottom() {
      var distance = e.scrollHeight - e.scrollTop - e.offsetHeight;
      return Math.floor(Math.abs(distance));
    }

    function handleAnchorClicks() {
      // TODO any way to get rid of jquery dependency? need event delegation though
      element.on('click', 'a', function (event) {
        event.preventDefault();
        event.stopPropagation();
        openExternal(event.target.getAttribute('href'));
        return false;
      });
    }

    function fetchBadges(timeout) {
      api.badges(scope.channel).then(function (badges) {
        scope.badges = badges;
      }).catch(function () {
        var delay = (timeout || 1000) * 2;
        setTimeout(function () {
          fetchBadges(delay)
        }, delay);
      });
    }
  }

  return {
    restrict: 'E',
    templateUrl: 'ng/elements/chat-output/chat-output.html',
    scope: {channel: '='},
    link: link
  }
});