import angular from 'angular';
import axios from 'axios';
import settings from '../../lib/settings';

angular.module('tc').factory('messages', (
  _, $rootScope, $filter, $http, irc, highlights, channels) => {
  
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
  channels.channels.forEach(make);
  channels.on('add', make);
  channels.on('remove', (channel) => delete messages[channel]);

  //=====================================================
  // Private methods
  //=====================================================
  function setupIrcListeners() {
    const listeners = getChatListeners();
    Object.keys(listeners).forEach((key) => {
      irc.on(key, listeners[key]);
    });
  }

  /**
   * Shows a notification chat message in all channels
   * @param {string} message
   */
  function addGlobalNotification(message) {
    settings.channels.forEach((channel) => addNotification(channel, message));
  }

  /**
   * Add a user message, types are 'action' or 'chat'
   * @param {string} type - 'action' or 'chat'
   * @param {string} channel
   * @param {object} user - As provided by tmi.js
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
  function addNotification(channel, message) {
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
  function addWhisper(from, to, message) {
    settings.channels.forEach((channel) => {
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
    messageObject.time = new Date().getTime();
    messages[channel].push(messageObject);
    if (messageObject.user) messages[channel].counter++;

    // Too many messages in memory
    // TODO unless autoscroll is off
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
  async function fetchFfzDonors() {
    var url = 'http://cdn.frankerfacez.com/script/donors.txt';
    const donors = (await axios(url)).data.split('\n').map((s) => s.trim());
    ffzDonors.concat(donors);
  }

  function isFfzDonor(username) {
    return ffzDonors.indexOf(username) > -1;
  }

  /** Mark previous messages from this user as deleted */
  function timeoutFromChat(channel, username) {
    channel = channel.substring(1);
    messages[channel].forEach((message) => {
      if (message.user && message.user.username === username) {
        message.deleted = true;
      }
    });
  }

  /** Applies transforms and emotes to a string */
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
    setTimeout(() => $rootScope.$apply(), 0);
  }

  function make(channel) {
    messages[channel] = [];
    messages[channel].counter = 0;
  }

  function getChatListeners() {
    return {
      action: (channel, user, message) => {
        addUserMessage('action', channel, user, message);
      },
      chat: (channel, user, message) => {
        addUserMessage('chat', channel, user, message);
      },
      clearchat: (channel) => {
        const msg = 'Chat cleared by a moderator. (Prevented by Tc)';
        addNotification(channel, msg);
      },
      connecting: () => addGlobalNotification('Connecting...'),
      connected: () => {
        settings.channels.forEach((channel) => {
          addNotification(channel, `Welcome to ${channel}'s chat.`);
        });
      },
      disconnected: () => {
        addGlobalNotification('Disconnected from the server.');
      },
      emoteonly: (channel, on) => {
        const enabled = 'Emote only mode has been enabled in the channel.';
        const disabled = 'Emote only mode has been disabled in the channel.';
        addNotification(channel, on ? enabled : disabled);
      },
      hosting: (channel, target) => {
        const msg = channel.substring(1) + ' is hosting ' + target;
        addNotification(channel, msg);
      },
      hosted: (channel, target, viewers) => {
        const msg = `${target} is hosting you with ${viewers} viewers.`;
        addNotification(channel, msg);
      },
      r9kbeta: (channel, on) => {
        const enabled = 'The channel is now in r9k mode.';
        const disabled = 'The channel is no longer in r9k mode.';
        addNotification(channel, on ? enabled : disabled);
      },
      slowmode: (channel, on, length) => {
        const disabled = 'This room is no longer in slow mode.';
        const enabled = 'This room is now in slow mode. ' +
          'You may send messages every ' + length + ' seconds.';
        addNotification(channel, on ? enabled : disabled);
      },
      subanniversary: (channel, username, months) => {
        const msg = `${username} subscribed for ${months} months in a row!`;
        addNotification(channel, msg);
      },
      subscription: (channel, username) => {
        addNotification(channel, username + ' has just subscribed!');
      },
      subscribers: (channel, on) => {
        let msg = 'The channel is no longer in subscriber-only mode';
        if (on) msg = 'The channel is now in subscriber-only mode.';
        addNotification(channel, msg);
      },
      timeout: (channel, username) => {
        timeoutFromChat(channel, username);
        addNotification(channel, username + ' has been timed out.');
      },
      unhost: (channel) => addNotification(channel, 'Stopped hosting.'),
      whisper: (from, message) => {
        addWhisper(from, settings.identity.username, message);
      }
    };
  }

  return Object.assign(
    (channel) => messages[channel],
    {
      addWhisper,
      addNotification,
      addGlobalNotification
    }
  );
});