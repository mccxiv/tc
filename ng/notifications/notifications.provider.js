/**
 * Displays notifications based on settings
 *
 * @ngdoc factory
 * @name notifications

 */
angular.module('tc').factory('notifications', function(settings, settingsGui) {

	settingsGui.addItem('Notifications', '<highlights-options></highlights-options>');

	return {

		/**
		 * Create and display a system notification (Eg. Balloon notification on Windows)
		 * @param {string} title           - Notification title
		 * @param {{body: string}} options - Notification body, inside options object
		 * @return {Notification}          - The Notification object that was created
		 */
		create: function(title, options) {
			return new Notification(title, options)
		}
	}
});