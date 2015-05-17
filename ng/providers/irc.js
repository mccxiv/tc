angular.module('tc').factory('irc', ['$rootScope', '$timeout', 'settings', function($rootScope, $timeout, settings) {
	
	//===============================================================
	// Variables
	//===============================================================
	var irc = require('twitch-irc');
	var Emitter = require('events').EventEmitter;
	var ee = new Emitter();
	var client;
	var clientWrite;
	var eventsToForward = [
		'action', 'chat', 'clearchat', 'connected', 'connecting', 'crash',
		'disconnected', 'hosted', 'hosting', 'slowmode', 'subanniversary',
		'subscriber', 'subscription', 'timeout', 'unhost'
	];
	
	//===============================================================
	// Public members
	//===============================================================
	ee.connected = false;
	ee.connecting = false;
	ee.badLogin = false;
	ee.login = makeNewClients;
	ee.credentialsValid = credentialsValid;
	ee.isMod = function(channel, username) {
		return client.isMod(channel, username);
	} ;
	ee.say = function(channel, msg) {
		clientWrite.say(channel, msg);
	};
	ee.logout = function() {
		$timeout(function() {
			destroyClient(client);
			destroyClient(clientWrite);
		});
	};

	//===============================================================
	// Setup
	//===============================================================
	onChannelsChange(function() {
		if (client.connected) {
			joinChannels(client);
			joinChannels(clientWrite);
			leaveChannels(client);
			leaveChannels(clientWrite);
		}
	});

	makeNewClients();
	
	// TODO remove debugging stuff
	window.$rootScope = $rootScope;
	window.irc = this;
	window.irc.ee = ee;

	//===============================================================
	// Private methods
	//===============================================================
	/**
	 * TODO better way to do this? eg. add them dynamically instead
	 *
	 * Re emits events from `emitter` on `reEmitter`
	 * @param {string[]} events    - Events to be rebroadcast
	 * @param {Object}   emitter   - Emits events to rebroadcast. Has .addListener()
	 * @param {Object}   reEmitter - The object that will rebroadcast. Has .emit()
	 */
	function forwardEvents(events, emitter, reEmitter) {
		events.forEach(function(event) {
			emitter.addListener(event, function() {
				var args = Array.prototype.slice.call(arguments);
				args.unshift(event);
				reEmitter.emit.apply(reEmitter, args);
			});
		});
	}

	function makeNewClients() {
		makeNewClient();
		makeNewClientWrite()
	}
	
	function makeNewClient() {
		destroyClient(client);
		if (credentialsValid()) {
			var clientSettings = {
				options: {
					exitOnError : false,
					emitSelf: false
				},
				loggerClass: TwitchIrcLogger,
				identity: settings.identity,
				channels: settings.channels
			};			
			client = new irc.client(clientSettings);
			window.client = client; // TODO remove
			attachListeners();
			client.once('connected', function() {joinChannels(client)});
			forwardEvents(eventsToForward, client, ee);
			client.connect();
		}
		else {
			console.log('IRC: Aborting creation of client because of invalid credentials');
		}
	}

	function makeNewClientWrite() {
		destroyClient(clientWrite);
		if (credentialsValid()) {
			var clientSettings = {
				options: {exitOnError : false},
				identity: settings.identity,
				channels: settings.channels
			};
			clientWrite = new irc.client(clientSettings);
			client.once('connected', function() {joinChannels(clientWrite)});
			clientWrite.connect();
		}
		else {
			console.log('IRC: Aborting creation of client because of invalid credentials');
		}
	}

	/**
	 * Joins any channels in settings.channels 
	 * that haven't been joined yet.
	 */
	function joinChannels(client) {
		client._tcJoined = client._tcJoined || [];
		settings.channels.forEach(function(channel) {
			console.log('checking if need to join '+channel);
			if (client._tcJoined.indexOf(channel) === -1) {
				client._tcJoined.push(channel);
				console.log('IRC: joining channel '+channel);
				client.join(channel);
			}
		})
	}

	/**
	 * Leaves joined channels that do not
	 * appear in settings.channels.
	 */
	function leaveChannels(client) {
		client._tcJoined = client._tcJoined || [];		
		for (var i = client._tcJoined.length - 1; i > -1; i--) {
			var channel = client._tcJoined[i];
			if (settings.channels.indexOf(channel) === -1) {
				console.log('IRC: leaving channel '+channel);
				client._tcJoined.splice(i, 1);
				client.part(channel);
			}
		}
	}
	
	function attachListeners() {
		client.addListener('disconnected', function(reason) {
			$timeout(function() {
				ee.connecting = false;
				ee.connected = false;
				if (reason === 'Login unsuccessful.') ee.badLogin = reason;
			});
		});		
		client.addListener('connected', function() {
			$timeout(function() {
				ee.connecting = false;
				ee.connected = true;
				ee.badLogin = false;
			});
		});
		client.addListener('connecting', setStatusConnecting);
		client.addListener('reconnect', setStatusConnecting);
		
		function setStatusConnecting() {
			$timeout(function() {
				ee.connecting = true;
			});
		}
	}

	function destroyClient(client) {
		// Need to track this to avoid emitting disconnect twice
		if (client && !client._tcDestroyed) {
			client.disconnect();
			client._tcDestroyed = true;
		}	
	}
	
	function onChannelsChange(cb) {
		$rootScope.$watchCollection(watchVal, handler); // TODO this is broken, watch collection instead?
		function watchVal() {return settings.channels;}
		function handler(newV, oldV) {
			if (newV !== oldV) {
				console.log('IRC: Channels changed.');
				console.log('IRC: Channels old', oldV);
				console.log('IRC: Channels new', newV);
				cb();
			}
		}
	}
	
	function credentialsValid() {
		return !!settings.identity.username.length && !!settings.identity.password.length;
	}
	
	return ee;
}]);