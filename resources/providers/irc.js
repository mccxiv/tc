angular.module('tc').factory('irc', ['$rootScope', 'settings', function($rootScope, settings) {
	
	var irc = require('twitch-irc');
	var Emitter = require("events").EventEmitter;
	var ee = new Emitter();
	var client;
	var events = [ 
		'action', 'chat', 'clearchat', 'connected', 
		'disconnected', 'hosted', 'hosting', 'subanniversary',
		'subscriber', 'timeout', 'unhost'
	];
	
	makeNewClient();

	onCredentialsChange(function() {
		destroyClient();
		makeNewClient();
	});
	
	onChannelsChange(function() {
		joinChannels();
		leaveChannels();
	});

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
		if (credentialsValid()) {
			var clientSettings = {
				options: {
					exitOnError : false,
					emitSelf: true
				},
				identity: settings.identity,
				channels: settings.channels
			};
			
			client = new irc.client(clientSettings);
			forwardEvents(events, client, ee);
			client.addListener('connected', joinChannels);
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
		client.tcJoined = client.tcJoined || [];
		
		for (var i = client.tcJoined.length - 1; i > -1; i--) {
			var channel = client.tcJoined[i];
			if (settings.channels.indexOf(channel) === -1) {
				console.log('IRC: leaving channel '+channel);
				client.tcJoined.splice(i, 1);
				client.part(channel);
			}
		}
	}

	function destroyClient() {
		console.log('IRC: Client when disconnecting:', client);
		// Need to track this to avoid emitting disconnect twice
		if (client && !client.destroyed) {
			client.disconnect();
			client.destroyed = true;
		}	
	}
	
	function onChannelsChange(cb) {
		$rootScope.$watchCollection(watchVal, handler); // TODO this is broken, watch collection instead?

		function watchVal() {
			return settings.channels;
		}

		function handler(newV, oldV) {
			if (newV !== oldV) {
				console.log('IRC: Channels changed.');
				console.log('IRC: Channels old', oldV);
				console.log('IRC: Channels new', newV);
				cb();
			}
		}
	}
	
	function onCredentialsChange(cb) {
		$rootScope.$watchCollection(watchVal, handler); // TODO this is broken, watch collection instead?
		
		function watchVal() {
			return settings.identity;
		}

		function handler(newV, oldV) {
			if (newV !== oldV) {
				console.log('IRC: Credentials changed.');
				cb();
			}
		}
	}
	
	function credentialsValid() {
		return !!settings.identity.password.length;
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
	
	ee.say = function(channel, msg) {
		client.say(channel, msg);	
	};
	
	return ee;
}]);