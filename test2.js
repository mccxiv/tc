var tmi = require('tmi.js');

var client = new tmi.client({
	connection: {random: 'chat'},
	channels: ['k3nt0456']
});

client.connect();

client.on('connecting', function() {
	console.log('CONNECTING EVENT');
});

client.on('connected', function() {
	console.log('CONNECTED EVENT');
});

client.on('disconnected', function() {
	console.log('DISCONNECTED EVENT');
});

client.on('slowmode', function(channel, on, time) {
	console.log(arguments);
});