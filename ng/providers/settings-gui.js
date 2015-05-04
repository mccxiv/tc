/**
 * Provides methods to register options pages and display them
 *
 * @ngdoc factory
 * @name settingsGui
 */
angular.module('tc').factory('settingsGui', function($mdDialog, $rootElement) {

	var entries = [];
	window.entries = entries;

	return {

		/**
		 * Register a new menu item for the options page.
		 * @param {string} name - Appears in the menu
		 * @param {string} html - Shown when the user selects this menu item
		 */
		addItem: function(name, html) {
			entries.push({name: name, html: html});
		},

		/**
		 * Returns a list of registered options menu items.
		 * @return {{name: {string}, html: {string}}[]}
		 */
		getItems: function() {
			console.log('SETTINGS-GUI: returning entries copy', angular.copy(entries));
			return entries;
		},

		/**
		 * Shows the options page.
		 * @param $event - Angular event used for the enter animation
		 */
		showPanel: function($event) {
			$mdDialog.show({
				parent: $rootElement,
				targetEvent: $event,
				templateUrl: 'ng/settings-panel/settings-gui-dialog.html',
				clickOutsideToClose: true
			});
		}
	}
});