angular.module('tc').controller('main', ['settings', function(settings) {
	this.channels = settings.channels;
	this.tabIndex = 0;
}]);