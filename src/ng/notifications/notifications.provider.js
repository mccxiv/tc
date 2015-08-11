/**
 * Display desktop notifications and sound warnings
 *
 * Automatically displays notifications based on settings and also
 * returns an object that allows the creation of custom notifications
 * or the independent playback of the notification sound.
 *
 * @ngdoc factory
 * @name notifications
 *
 * @type {object}
 * @property {function} create     - Creates and displays desktop notifications
 * @property {function} playSound  - Plays the notification sound, regardless of settings
 *
 */
angular.module('tc').factory('notifications', function(irc, settings, highlights) {

	var sound = new Audio('assets/notification.ogg');

	irc.on('disconnected', function() {
		if (settings.notifications.onConnect) {
			n('Disconnected', 'The connection to the chat server has ended.');
		}
	});

	irc.on('crash', function() {
		// TODO do something more helpful than just report
		n('Crashed', 'Sorry, the IRC client has crashed. Please restart the application.');
	});

	irc.on('whisper', function(from, message) {
		if (settings.notifications.onWhisper) {
			n('Whisper from ' + from, message);
			if (settings.notifications.soundOnMention) sound.play();
		}
	});

	irc.on('chat', fromUser);
	irc.on('action', fromUser);

	function fromUser(channel, user, message) {
		if (settings.notifications.onMention) {
			// TODO inefficient, runs test twice: here and in messages
			if (highlights.test(message)) {
				channel = channel.substring(1);
				n('Mentioned on '+channel, user['display-name']+': '+message);
				if (settings.notifications.soundOnMention) {
					sound.play();
				}
			}
		}
	}

	function n(title, body) {
		console.log('NOTIFICATIONS: firing notification', title, body);
		return new Notification(title, {body: body});
	}

	return {
		/**
		 * Create notifications.
		 * Will play the notification sound if the settings allow for it.
		 *
		 * @param {string} title    - Notification title
		 * @param {string} body     - Notification body
		 * @return {Notification}   - The Notification object that was created
		 */
		create: n,

		/**
		 * Play the notification sound, regardless of settings.
		 */
		playSound: sound.play
	}
});