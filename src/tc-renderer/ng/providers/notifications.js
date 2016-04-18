import angular from 'angular';
import notificationSound from '../../../assets/notification.ogg';
import settings from '../../lib/settings';

angular.module('tc').factory('notifications', (irc, highlights, trayIcon) => {

  var sound = new Audio(notificationSound);

  irc.on('disconnected', () => {
    if (settings.notifications.onConnect) {
      n('Disconnected', 'The connection to the chat server has ended.');
    }
  });

  irc.on('whisper', (from, message) => {
    if (settings.notifications.onWhisper) {
      if (settings.chat.ignored.indexOf(from.username) >= 0) return;
      n('Whisper from ' + (from['display-name'] || from.username), message);
      if (settings.notifications.soundOnMention) sound.play();
    }
  });

  irc.on('chat', fromUser);
  irc.on('action', fromUser);

  function fromUser(channel, user, message) {
    if (settings.notifications.onMention) {
      if (settings.chat.ignored.indexOf(user.username) >= 0) return;
      // TODO inefficient, runs test twice: here and in messages
      if (highlights.test(message) &&
        settings.identity.username.toLowerCase() != user.username) {
        channel = channel.substring(1);
        n('Mentioned on ' + channel, user['display-name'] + ': ' + message);
        if (settings.notifications.soundOnMention) {
          sound.play();
        }
      }
    }
  }

  /**
   * Create notifications.
   *
   * @param {string} title     - Notification title
   * @param {string} body      - Notification body
   * @return {Notification}    - The Notification object that was created
   */
  function n(title, body) {
    if (process.platform !== 'win32') new Notification(title, {body: body});
    else trayIcon.displayBalloon({title: title, content: body});
  }

  return {
    create: n,

    // Play the notification sound, regardless of settings.
    playSound: sound.play.bind(sound)
  }
});