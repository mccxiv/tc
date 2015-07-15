//var irc = require('twitch-irc');
var irc = require('tmi.js');

var client = new irc.client({
	connection: {random: 'chat'},
	/*"identity": {
		"username": "k3nt0456",
		"password": ""
	},*/
});

client.connect();

/*client.on('whisper', function() {
	console.log('args receiving', arguments);
});*/

/*setTimeout(function() {
	client.whisper('k3nt0456_test', 'message!').then(function() {
		console.log('args sending', arguments);
	});
}, 4000);*/

client.on('pong', function() {
	console.log('server PONG!');
});


setTimeout(function() {
	client.ping();
}, 6000);