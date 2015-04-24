angular.module('tc').factory('irc', ['$rootScope', '$timeout', 'settings', function($rootScope, $timeout, settings) {
	
	//===============================================================
	// Variables
	//===============================================================
	var irc = require('twitch-irc');
	var Emitter = require('events').EventEmitter;
	var ee = new Emitter();
	var client;
	var eventsToForward = [ 
		'action', 'chat', 'clearchat', 'connected', 
		'disconnected', 'hosted', 'hosting', 'subanniversary',
		'subscriber', 'timeout', 'unhost'
	];
	
	//===============================================================
	// Public members
	//===============================================================
	ee.connected = false;
	ee.connecting = false;
	ee.badLogin = false;
	ee.login = makeNewClient;
	ee.credentialsValid = credentialsValid;
	ee.say = function(channel, msg) {
		client.say(channel, msg);
	};
	ee.logout = function() {
		$timeout(function() {
			destroyClient();
		});
	};

	//===============================================================
	// Setup
	//===============================================================
	onChannelsChange(function() {
		if (client.connected) {
			joinChannels();
			leaveChannels();
		}
	});

	makeNewClient();

	//===============================================================
	// Private methods
	//===============================================================
	/**
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
				console.log('IRC: Rebroadcasting with args', args);
				reEmitter.emit.apply(reEmitter, args);
			});
		});
	}
	
	function makeNewClient() {
		destroyClient();
		if (credentialsValid()) {
			var clientSettings = {
				options: {
					exitOnError : false,
					emitSelf: true
				},
				loggerClass: TwitchIrcLogger,
				identity: settings.identity,
				channels: settings.channels
			};			
			client = new irc.client(clientSettings);
			window.client = client; // TODO remove
			attachListeners();
			forwardEvents(eventsToForward, client, ee);
			client.connect();			
			attachDebuggingListeners();
		}
		else {
			console.log('IRC: Aborting creation of client because of invalid credentials');
		}
	}

	/**
	 * Joins any channels in settings.channels 
	 * that haven't been joined yet.
	 */
	function joinChannels() {
		client.tcJoined = client.tcJoined || [];		
		settings.channels.forEach(function(channel) {
			console.log('checking if need to join '+channel);
			if (client.tcJoined.indexOf(channel) === -1) {
				client.tcJoined.push(channel);
				console.log('IRC: joining channel '+channel);
				client.join(channel);
			}
		})
	}

	/**
	 * Leaves joined channels that do not
	 * appear in settings.channels.
	 */
	function leaveChannels() {
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
		client.once('connected', joinChannels);
		
		function setStatusConnecting() {
			$timeout(function() {
				ee.connecting = true;
			});
		}
	}

	function destroyClient() {
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
	
	function attachDebuggingListeners() {
		client.addListener('chat', function(ch, usr, msg) {
			console.log('======== Message =====================');
			console.log('channel', ch);
			console.log('user', usr);
			console.log('message', msg);
			console.log('emotes', usr.emote);
			console.log('======== Msg end =====================');
		});
		client.addListener('connected', function() {
			console.info('Connected');
		});
		client.addListener('disconnected', function() {
			console.warn('Disconnected');
		});	
	}
	
	window.irc = this;
	window.irc.ee = ee;
	
	return ee;
}]);