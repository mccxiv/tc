/**
 * Checks for updates and shows a notification
 *
 * @ngdoc factory
 * @name updateChecker
 */
angular.module('tc').factory('updateChecker', function($http, $mdToast, notifications, gui) {

	var semverDiff = require('semver-diff');
	var version = gui.App.manifest.version;
	var latest;
	var url = 'https://api.github.com/repos/mccxiv/tc/releases?callback=JSON_CALLBACK';

	$http.jsonp(url).success(function(response) {
		latest = response.data[0].tag_name;
		//latest = "1.0.0-beta.99"; // For testing;
		setTimeout(notify, 5000);
	});

	function notify() {
		if (semverDiff(version, latest)) {
			var toast = $mdToast.show(
				$mdToast.simple()
					.content('New version available!')
					.position('bottom right')
					.hideDelay(25000)
					.action('DOWNLOAD')
			);
			toast.then(function() {
				gui.Shell.openExternal('http://mccxiv.github.io/tc/');
			});
			notifications.create('New version of Tc!', latest+' is available for download.');
		}
	}

	return {show : notify};
});