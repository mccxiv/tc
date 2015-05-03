/**
 * Opens the options panel.
 *
 * @ngdoc factory
 * @name settingsGui
 */
angular.module('tc').factory('settingsGui', function($mdDialog, $rootElement) {
	return {

		/**
		 * Register a new menu item for the options page.
		 * @param {string} name - Appears in the menu
		 * @param {string} html - Shown when the user selects this menu item
		 */
		addItem: function(name, html) {

		},

		/**
		 * Returns a list of registered options menu items.
		 * @return {{name: {string}, html: {string}}[]}
		 */
		getItems: function() {

		},

		/**
		 * Shows the options page.
		 * @param $event - Angular event used for the enter animation
		 */
		showPanel: function($event) {
			$mdDialog.show({
				parent: $rootElement,
				targetEvent: $event,
				template: '<md-dialog><md-content style="padding: 0"><settings-panel></settings-panel></md-content></md-dialog>',
				clickOutsideToClose: true
			});
		}
	}
});