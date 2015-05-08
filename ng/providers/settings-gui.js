/**
 * Provides methods to register options pages and display them
 *
 * @ngdoc factory
 * @name settingsGui
 */
angular.module('tc').factory('settingsGui', function($mdDialog, $rootElement) {
	return {
		/**
		 * Shows the options page.
		 * @param $event - Angular event used for the enter animation
		 */
		show: function($event) {
			$mdDialog.show({
				parent: $rootElement,
				targetEvent: $event,
				templateUrl: 'ng/settings-panel/settings-gui-dialog.html',
				clickOutsideToClose: true
			});
		}
	}
});