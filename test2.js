var irc = require('twitch-irc');

var client = new irc.client({channels: ['twitchplayspokemon']});
client.connect();

client.addListener('chat', function(channel, user, message) {
	if (typeof user['display-name'] === 'boolean') {
		console.log(user.username + '\'s display name is ' + user['display-name']);
	}
});

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
