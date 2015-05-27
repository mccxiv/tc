var irc = require('twitch-irc');

var clientSettings = {
	options: {
		debug: true,
		emitSelf: true
	},
	identity: {
		username: 'k3nt0456',
		password: 'aaaaa'
	}
};

var client = new irc.client(clientSettings);
client.connect();

client.addListener('connected', function() {
	client.join(clientSettings.identity.username);
});

client.addListener('chat', function(channel, user, message) {
	console.log('Received: ', message);
});

/*
setTimeout(function() {
	console.log('Sending first');
	client.say(clientSettings.identity.username, 'first message');
}, 4000);

setTimeout(function() {
	console.log('Sending second');
	client.say(clientSettings.identity.username, 'second message');
}, 5000);*/
