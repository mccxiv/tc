var tmi = require('tmi.js');

var client = new tmi.client({
	connection: {random: 'chat'},
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