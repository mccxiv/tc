/**
 * Checks for updates and shows a notification
 *
 * @ngdoc factory
 * @name updateChecker
 */
angular.module('tc').factory('updateChecker', function(
	$http, $mdToast, notifications, manifest, openExternal) {
	console.log('LOAD: updateChecker');

	var semverDiff = require('semver-diff');
	var version = manifest.version;
	var url = 'https://api.github.com/repos/mccxiv/tc/releases' +
		'?callback=JSON_CALLBACK';

	function check() {
		$http.jsonp(url).success(function(response) {
			var latest = response.data[0].tag_name;
			//latest = "1.0.0-beta.99"; // For testing
			notify(latest);
		});
	}

	function notify(latest) {
		if (semverDiff(version, latest)) {
			var toast = $mdToast.show(
				$mdToast.simple()
					.content('New version available!')
					.position('bottom right')
					.hideDelay(25000)
					.action('DOWNLOAD')
			);
			toast.then(function(response) {
				if (response === 'ok') {
					openExternal('http://mccxiv.github.io/tc/#download');
				}
			});
			notifications.create('New version of Tc!',
				latest+' is available for download.');
		}
	}

	// Check on load and once a day
	setTimeout(check, 5000);
	setInterval(check, 86400000);

	return {check: check};
});