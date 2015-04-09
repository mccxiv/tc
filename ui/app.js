var ipc = require('ipc');
console.log('debugging');

ipc.on('chat', function(channel, user, message) {
	console.log('chat msg: ' + user.username + ': ' + message);
});