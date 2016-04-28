import _ from 'lodash';
import angular from 'angular';
import axios from 'axios';
import settings from '../../lib/settings/settings';
import channels from '../../lib/channels';
import processMessage from '../../lib/transforms/process-message';

angular.module('tc').factory('messages', ($rootScope, irc, highlights) => {  
  //=====================================================
  // Variables
  //=====================================================
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
  // Public methods
  //=====================================================
  /** Shows a notification chat message in all channels */
  function addGlobalNotification(message) {
    settings.channels.forEach((channel) => addNotification(channel, message));
  }

  /** Adds a message with the 'notification' type */
  function addNotification(channel, message) {
    addMessage(channel, {
      type: 'notification',
      message,
      style: 'color: #999999'
    });
  }
  
  /** Adds a message with the 'whisper' type */
  function addWhisper(user, message) {
    settings.channels.forEach((channel) => {
      addMessage(channel, {
        type: 'whisper',
        user,
        to: 'Me',
        message: escape(message),
        style: 'color: #999999'
      });
    });
  }

  async function getMoreBacklog(channel) {
    getBacklog(channel, earliestMessageTimestampInSec(channel))
  }

  //=====================================================
  // Private methods
  //=====================================================
  function setupIrcListeners() {
    const listeners = getChatListeners();
    Object.keys(listeners).forEach((key) => {
      irc.on(key, listeners[key]);
    });
  }

  async function getBacklog(channel, before = now(), after = 0) {
    const url = 'https://backlog.gettc.xyz/' + channel;
    const backlog = (await axios(url, {params: {before, after}})).data;
    backlog.forEach((obj) => {
      obj.type = obj.user['message-type'];
      obj.fromBacklog = true;
      obj.at *= 1000; // API gives seconds, need ms
      addUserMessage(channel, obj);
    });
    sortMessages(channel);
  }

  async function getMissingMessages(channel) {
    getBacklog(channel, now(), mostRecentMessageTimestampInSec(channel));
  }

  function sortMessages(channel) {
    messages[channel].sort((a, b) => a.at - b.at);
  }

  /**
   * Add a user message.
   * @property {string}  obj.type - 'action' or 'chat'
   * @property {string}  obj.channel
   * @property {object}  obj.user - As provided by tmi.js
   * @property {string}  obj.message
   * @property {boolean} obj.fromBacklog
   * @property {number}  obj.at - Timestamp
   */
  function addUserMessage(channel, obj) {
    const {type, user, message} = obj;
    const notSelf = user.username != lowerCaseUsername;

    if (settings.chat.ignored.indexOf(user.username) > -1) return;
    if (user.special) user.special.reverse();
    if (!user['display-name']) user['display-name'] = user.username;
    if (isFfzDonor(user.username)) user.ffz_donor = true;
    if (highlights.test(message) && notSelf) obj.highlighted = true;
    if (type === 'action') obj.style = 'color: ' + user.color;

    addMessage(channel, obj);
  }

  /**
   * Adds a message object to the message list
   * Not used directly, but via helpers
   * @param {string} channel
   * @param {object} messageObject
   */
  function addMessage(channel, messageObject) {
    const {type, fromBacklog} = messageObject;
    if (channel.charAt(0) === '#') channel = channel.substring(1);
    if (!messageObject.at) messageObject.at = Date.now();

    const twitchEmotes = messageObject.user? messageObject.user.emotes : null;
    const msg = processMessage(messageObject.message, channel, twitchEmotes);

    messageObject.message = msg;
    messages[channel].push(messageObject);

    if ((type === 'chat' || type === 'action') && !fromBacklog) {
      messages[channel].counter++;
    }

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
  function now() {
    return Math.round(Date.now() / 1000);
  }

  function earliestMessageTimestampInSec(channel) {
    const msgs = messages[channel];
    if (!msgs || !msgs.length) return now();
    else return Math.round(msgs[0].at / 1000);
  }

  function mostRecentMessageTimestampInSec(channel) {
    const msgs = messages[channel];
    if (!msgs || !msgs.length) return 0;
    else {
      const recentMessage = msgs.slice().reverse().find((msg) => {
        return msg.type === 'chat' || msg.type === 'action';
      });
      return recentMessage? Math.round(recentMessage.at / 1000) : 0;
    }
  }

  async function fetchFfzDonors() {
    const req = await axios('http://cdn.frankerfacez.com/script/donors.txt');
    const donors = req.data.split('\n').map((s) => s.trim());
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
        addUserMessage(channel, {type: 'action', user, message});
      },
      chat: (channel, user, message) => {
        addUserMessage(channel, {type: 'chat', user, message});
      },
      clearchat: (channel) => {
        const msg = 'Chat cleared by a moderator. (Prevented by Tc)';
        addNotification(channel, msg);
      },
      connecting: () => addGlobalNotification('Connecting...'),
      connected: () => {
        settings.channels.forEach((channel) => {
          addNotification(channel, `Welcome to ${channel}'s chat.`);
          getMissingMessages(channel);
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
      whisper: (from, message) => addWhisper(from, message)
    };
  }

  return Object.assign(
    (channel) => messages[channel],
    {
      addWhisper,
      getMoreBacklog,
      addNotification,
      addGlobalNotification
    }
  );
});