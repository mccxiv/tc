angular.module('tc').controller('main', ['settings', 'irc', function(settings, irc) {
	this.channels = settings.channels;
}]);