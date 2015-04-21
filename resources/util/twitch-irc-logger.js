var details    = false;

/* Our awesome TwitchIrcLogger */
function TwitchIrcLogger(config) {
	console.log('TIL: logging.');
}

/* Tokens used in templates */
TwitchIrcLogger.prototype.tokens = {
	timestamp: function() {
		var str         = '';
		var currentTime = new Date();
		var hours       = currentTime.getHours();
		var minutes     = currentTime.getMinutes();
		var seconds     = currentTime.getSeconds();

		if (hours < 10) { hours = '0' + hours }
		if (minutes < 10) { minutes = '0' + minutes }
		if (seconds < 10) { seconds = '0' + seconds }
		str += hours + ':' + minutes + ':' + seconds;

		return str;
	}
};

/* Custom levels */
TwitchIrcLogger.prototype.levels = {
	dev:  7,
	chat:  6,
	action:  6,
	raw:   5,
	event: 4,
	info:  3,
	error: 2,
	crash: 1
};

/* Replace the message and it's tokens */
TwitchIrcLogger.prototype.message = function(level, str) {
	console.log(level, str);
};

/* Send the message to the stream(s) */
TwitchIrcLogger.prototype.log = function(level, str) {
	console.log(level, str);
};

/* TwitchIrcLogger prototypes */
TwitchIrcLogger.prototype.chat    = function(str) { return this.log('chat', arguments) };
TwitchIrcLogger.prototype.action  = function(str) { return this.log('action', arguments) };
TwitchIrcLogger.prototype.dev     = function(str) { return this.log('dev', arguments) };
TwitchIrcLogger.prototype.inspect = function(obj) { return this.log('info', util.inspect(obj)); };
TwitchIrcLogger.prototype.raw     = function(str) { return this.log('raw', arguments); };
TwitchIrcLogger.prototype.event   = function(str) { return this.log('event', arguments) };
TwitchIrcLogger.prototype.info    = function(str) { return this.log('info', arguments) };
TwitchIrcLogger.prototype.error   = function(str) { return this.log('error', arguments) };
TwitchIrcLogger.prototype.crash   = function(str) { return this.log('crash', arguments) };
