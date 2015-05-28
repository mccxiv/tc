/**
 * Displays notifications based on settings
 *
 * @ngdoc factory
 * @name notifications

 */
angular.module('tc').factory('notifications', function(irc, settings, highlights) {

	var sound = new Audio('assets/notification.ogg');

	irc.addListener('disconnected', function() {
		if (settings.notifications.onConnect) {
			n('Disconnected', 'The connection to the chat server has ended.');
		}
	});

	irc.addListener('crash', function() {
		// TODO do something more helpful than just report
		n('Crashed', 'Sorry, the IRC client has crashed. Please restart the application.');
	});

	irc.addListener('chat', fromUser);
	irc.addListener('action', fromUser);

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
		 * Create and display a system notification (Eg. Balloon notification on Windows)
		 * @param {string} title           - Notification title
		 * @param {string} body            - Notification body
		 * @return {Notification}          - The Notification object that was created
		 */
		create: n
	}
});