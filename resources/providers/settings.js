angular.module('tc').factory('settings', function() {
	return {
		username: '',
		password: '',
		selectedTabIndex: 0,
		channels: ['#k3nt0456', '#itshafu']
	}
});

angular.module('tc').factory('sessionSettings', function() {
	return {
		username: '',
		password: '',
		selectedTabIndex: 0,
		channels: ['#k3nt0456', '#itshafu']
	}
});