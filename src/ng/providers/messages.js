/**
 * @typedef {Object} MessagePart
 *
 * @property {string} string      - A piece of text that filters could act on
 * @property {isElement} boolean  - Filters would probably ignore this message part if it's an element
 *
 * @description
 * Chat message filters receive and return an array of these objects.
 * It makes it easier to know which sections of the string should be filtered
 * and which should be left alone.
 * Examples of why this is important:
 * - Avoid converting an emoticon's url to a link
 * - Avoid escaping the html of emoticons and links
 */

/**
 * Stores messages.
 *
 * Deals with storing chat messages, some come from the server,
 * others are local (such as outgoing whispers) and some are system notifications.
 * The factory returns a function that can be used to obtain messages, but
 * this function object also has other methods attached.
 *
 * @ngdoc factory
 * @name messages
 * @type function
 *
 * @param {string} channel                     - Twitch channel
 * @return {object[]}                          - List of message objects for this channel
 *
 * @property {function} addWhisper             - Adds a local whisper message (outgoing, most likely)
 * @property {function} addNotification        - Adds a notification message to a chat channel (light gray)
 * @property {function} addGlobalNotification  - Adds a notification message to all chat channels (light gray)
 */
angular.module('tc').factory('messages', function ($rootScope, $filter, $http, irc, api, highlights, settings, channels) {
  
  //=====================================================
  // Variables | TODO dry
  //=====================================================
  var capitalize = $filter('capitalize');
  var emotify = $filter('emotify');
  var linkify = $filter('linkify');
  var escape = $filter('escape');
  var combine = $filter('combine');
  var ffzfy = $filter('ffzfy');
  var bttvfy = $filter('bttvfy');
  var ffzDonors = [];
  var messageLimit = 500;
  var messages = {};
  var lowerCaseUsername = settings.identity.username.toLowerCase();
  var throttledApplySlow = _.throttle(applyLate, 3000);
  var throttledApplyFast = _.throttle(applyLate, 100);

  //=====================================================
  // Setup
  //=====================================================
  fetchFfzDonors();
  setupIrcListeners();
  channels.on('remove', function (channel) {
    delete messages[channel];
  });

  //=====================================================
  // Public methods
  //=====================================================
  var messagesReturn = function getMessages(channel) {
    if (!messages[channel]) make(channel);
    return messages[channel];
  };

  messagesReturn.addWhisper = addWhisperMessage;
  messagesReturn.addNotification = addNotificationMessage;
  messagesReturn.addGlobalNotification = addGlobalNotificationMessage;

  //=====================================================
  // Private methods
  //=====================================================
  function setupIrcListeners() {

    irc.on('connecting', function () {
      addGlobalNotificationMessage('Connecting...');
    });

    irc.on('disconnected', function () {
      addGlobalNotificationMessage('Disconnected from the server.')
    });

    irc.on('chat', function (channel, user, message) {
      addUserMessage('chat', channel, user, message);
    });

    irc.on('action', function (channel, user, message) {
      addUserMessage('action', channel, user, message);
    });

    irc.on('connected', function () {
      settings.channels.forEach(function (channel) {
        addNotificationMessage(channel, 'Welcome to ' + channel + '\'s chat.');
      });
    });

    irc.on('hosting', function (channel, target) {
      addNotificationMessage(channel, channel.substring(1) + ' is hosting ' + target);
    });

    irc.on('hosted', function (channel, target, viewers) {
      addNotificationMessage(channel, target + ' is hosting you with ' + viewers + ' viewers.');
    });

    irc.on('slowmode', function (channel, enabled, length) {
      var msg;
      if (!enabled) msg = 'This room is no longer in slow mode.';
      // TODO length is currently missing from tmi.js, re-add it once it's back
      //else msg = 'This room is now in slow mode. You may send messages every '+length+' seconds.';
      else msg = 'This room is now in slow mode.';
      addNotificationMessage(channel, msg);
    });

    irc.on('subanniversary', function (channel, username, months) {
      addNotificationMessage(channel, username + ' subscribed for ' + months + ' months in a row!');
    });

    irc.on('subscription', function (channel, username) {
      addNotificationMessage(channel, username + ' has just subscribed!');
    });

    irc.on('timeout', function (channel, username) {
      timeout(channel, username);
      addNotificationMessage(channel, username + ' has been timed out.');
    });

    irc.on('unhost', function (channel) {
      addNotificationMessage(channel, 'Stopped hosting.');
    });

    irc.on('whisper', function (from, message) {
      addWhisperMessage(from, settings.identity.username, message);
    });
  }

  /**
   * Shows a notification chat message in all channels
   * @param {string} message
   */
  function addGlobalNotificationMessage(message) {
    settings.channels.forEach(function (channel) {
      addNotificationMessage(channel, message);
    });
  }

  /**
   * Add a user message, types are 'action' or 'chat'
   * @param {string} type - 'action' or 'chat'
   * @param {string} channel
   * @param {object} user - As provided by twitch-irc
   * @param {string} message
   */
  function addUserMessage(type, channel, user, message) {
    if (user.special) user.special.reverse();
    channel = channel.substring(1);
    if (!user['display-name']) user['display-name'] = user.username;
    if (settings.chat.ignored.indexOf(user.username) >= 0) return;

    var notSelf = user.username != lowerCaseUsername;
    if (isFfzDonor(user.username)) user.ffz_donor = true;

    addMessage(channel, {
      user: user,
      type: type,
      highlighted: highlights.test(message) && notSelf ? true : false,
      message: processMessage(message, channel, user.emotes),
      style: type === 'action' ? 'color: ' + user.color : ''
    });
  }

  /**
   * Adds a message with the 'notification' type
   * @param {string} channel
   * @param {string} message
   */
  function addNotificationMessage(channel, message) {
    addMessage(channel, {
      type: 'notification',
      message: capitalize(escape(message)),
      style: 'color: #999999'
    });
  }

  /**
   * Adds a message with the 'whisper' type
   * @param {string} from
   * @param {string} to
   * @param {string} message
   */
  function addWhisperMessage(from, to, message) {
    settings.channels.forEach(function (channel) {
      addMessage(channel, {
        type: 'whisper',
        from: capitalize(from['display-name'] || from.username),
        to: capitalize(to),
        message: escape(message),
        style: 'color: #999999'
      });
    });
  }

  /**
   * Adds a message object to the message list
   * Not used directly, but via helpers
   * @param {string} channel
   * @param {object} messageObject
   */
  function addMessage(channel, messageObject) {
    if (channel.charAt(0) === '#') channel = channel.substring(1);
    if (!messages[channel]) make(channel);
    messageObject.time = new Date().getTime();
    messages[channel].push(messageObject);
    if (messageObject.user) messages[channel].counter++;

    // Too many messages in memory
    if (messages[channel].length > messageLimit) {
      messages[channel].shift();
    }

    // TODO get rid of this completely, refactor somehow.
    // it makes this service UI aware and feels dirty, but it's
    // a massive performance boost to check and only $apply if
    // the message is for the currently selected channel
    if (channel === settings.channels[settings.selectedTabIndex]) {
      throttledApplyFast();
    }
    else if (messageObject.user) {
      throttledApplySlow();
    }
  }

  //=====================================================
  // Helper methods
  //=====================================================
  function fetchFfzDonors() {
    var url = 'http://cdn.frankerfacez.com/script/donors.txt';
    $http.get(url).then(function (result) {
      ffzDonors.push.apply(ffzDonors, result.data.split('\n').map(function (s) {
        return s.trim();
      }));
    });
  }

  function isFfzDonor(username) {
    return ffzDonors.indexOf(username) > -1;
  }

  function timeout(channel, username) {
    channel = channel.substring(1);
    if (messages[channel]) {
      messages[channel].forEach(function (message) {
        if (message.user && message.user.username === username) {
          message.deleted = true;
        }
      });
    }
  }

  /**
   * Applies transforms and emotes to a string
   */
  function processMessage(msg, channel, userEmotes) {
    msg = emotify(msg, userEmotes);
    msg = ffzfy(channel, msg);
    msg = bttvfy(channel, msg);
    msg = linkify(msg);
    msg = escape(msg);
    msg = combine(msg);
    return msg;
  }

  /**
   * Because of inconsistent sync/async APIs
   * the $apply() operation should be delayed to the next cycle
   * TODO see if this is a performance issue
   */
  function applyLate() {
    setTimeout(function () {
      $rootScope.$apply();
    }, 0);
  }

  function make(channel) {
    messages[channel] = [];
    messages[channel].counter = 0;
  }

  return messagesReturn;
});