angular.module('tc').factory('irc', ['$rootScope', '$q', 'settings', function($rootScope, $q, settings) {
	
	var irc = require('twitch-irc');
	var client;
	var deferred;
	var resolved;
	var returnVal = {};
	var credentials = [settings.username, settings.password];
	
	createPromise();
	connectIfValid();

	// Watch for credential changes on the settings, reconnect if necessary
	$rootScope.$watch(watchVal, onCredentialsChange); // TODO this is broken

	function createPromise() {
		resolved = false;
		deferred = $q.defer();
		returnVal.client = deferred.promise;
	}
	
	function watchVal() {
		return credentials;
	}

	function onCredentialsChange(newV, oldV) {
		if (newV !== oldV) {
			console.log('Credentials changed.');
			if (resolved) {
				console.log('Was already connected, disconnecting.');
				disconnect();
				createPromise();
			}
			connectIfValid();
		} 
		else console.log('Credentials changed but they were the same.');
	}
	
	function disconnect() {
		client.disconnect();
	}
	
	function connectIfValid() {
		if (valid(settings.username) && valid(settings.password)) {
			client = new irc.client({identity: {
				username: settings.username,
				password: settings.password
			}});
			
			client.addListener('chat', function(ch, usr, msg) {
				console.log(ch+' '+usr+': '+msg);
			});
			
			client.connect();
			
			// TODO error handling			
			deferred.resolve(client);
			resolved = true;
		}
	}

	function valid(s) {
		return typeof s === 'string' && s.length;
	}
	
	return returnVal;
}]);