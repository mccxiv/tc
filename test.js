var irc = require('twitch-irc');

var clientSettings = {
	options: {
		debug: true
	}
};

var client = new irc.client(clientSettings);
client.connect();

client.addListener('connected', function() {
	client.join('itshafu');
});




/*client.addListener('connected', function() {
	client.join(clientSettings.identity.username);
});

client.addListener('chat', function(channel, user, message) {
	console.log('Received: ', message);
});*/


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
