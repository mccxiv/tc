angular.module('tc').factory('irc', ['settings', function(settings) {
	
	var client;
	var clientOptions = {};
	var irc = require('twitch-irc');

	clientOptions.options = {debug: true};
	
	client = new irc.client(clientOptions);
	client.connect(); // TODO needs to make sure we have credentials
	
	console.log('client is', client);

	client.addListener('chat', function (channel, user, message) {
		console.log('['+channel+'] '+user.username+': '+message);
	});
	
	window.client = client;
	
	return client;
}]);