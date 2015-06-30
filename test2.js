//var irc = require('twitch-irc');
var irc = require('tmi.js');

var client = new irc.client({
	connection: {random: 'group'},
	"identity": {
		"username": "k3nt0456",
		"password": ""
	},
});

client.connect();

client.on('whisper', function() {
	console.log('args receiving', arguments);
});

setTimeout(function() {
	client.whisper('k3nt0456_test', 'message!').then(function() {
		console.log('args sending', arguments);
	});
}, 4000);


/*
 client.addListener('connected', function() {
 client.join('twitchplayspokemon');
 });*/

/*client.addListener('connected', function() {
	client.join(clientSettings.identity.username);
});

*/


/*
client.addListener('hosting', function(channel, target, viewers) {
	console.log('hosting event, with '+viewers+' viewers');
});*/

/*
setTimeout(function() {
	console.log('Sending first');
	client.say(clientSettings.identity.username, 'first message');
}, 4000);

setTimeout(function() {
	console.log('Sending second');
	client.say(clientSettings.identity.username, 'second message');
}, 5000);*/
