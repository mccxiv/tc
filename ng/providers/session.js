/**
 * Just a simple object to store data on.
 * Unlike `settings`, it does not save to disk
 *
 * @ngdoc factory
 * @name session
 */
angular.module('tc').factory('session', function() {
	return {
		selectedUser: null,
		selectedUserChannel: null
	};
});