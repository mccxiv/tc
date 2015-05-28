angular.module('tc').factory('irc', function($rootScope, $timeout, $q, settings) {
	
	//===============================================================
	// Variables
	//===============================================================
	var irc = require('twitch-irc');
	var Emitter = require('events').EventEmitter;
	var ee = new Emitter();
	var clients = {read: null, write: null};
	
	//===============================================================
	// Public members
	//===============================================================
	ee.badLogin = false;
	ee.credentialsValid = credentialsValid;

	ee.isMod = function(channel, username) {
		return clients.write.isMod(channel, username);
	};

	ee.say = function(channel, msg) {
		clients.write.say(channel, msg);
	};

	// TODO debug stuff
	window.getClients = function() {return clients;};

	//===============================================================
	// Setup
	//===============================================================
	onChannelsChange(syncChannels);
	onInvalidCredentials(destroy);
	onValidCredentials(connect);
	onEitherDisconnect(function() {destroy(connectMaybe);});

	// needs to be after onEitherDisconnect
	connectMaybe();

	//===============================================================
	// Private methods
	//===============================================================

	/**
	 * Creates both irc clients and attaches listeners to them
	 */
	function connect() {
		ee.badLogin = false;
		var clientSettings = {
			options: {exitOnError : false},
			connection: {reconnect: false},
			loggerClass: TwitchIrcLogger,
			identity: settings.identity,
			channels: settings.channels
		};
		Object.keys(clients).forEach(function(key) {
			console.log('IRC: creating a client');
			var settings = angular.copy(clientSettings);
			if (key === 'write') settings.loggerClass = undefined;
			clients[key] =  new irc.client(settings);
			clients[key].connect();
		});
		attachReadListeners();
		attachWriteListeners();
		forwardEvents(clients.read, ee);
	}

	function connectMaybe() {
		if (credentialsValid() && !ee.badLogin) connect();
	}

	function attachReadListeners() {
		clients.read.once('connected', function() {
			joinChannels(clients.read);
			$rootScope.$apply();
		});

		clients.read.once('disconnected', function(reason) {
			if (reason === 'Login unsuccessful.') {
				ee.badLogin = reason;
				settings.identity.password = '';
				$rootScope.$apply();
			}
		});
	}

	function attachWriteListeners() {
		clients.write.once('connected', function() {
			joinChannels(clients.write);
			ee.emit('say-available');
		});

		clients.write.once('disconnected', function() {
			ee.emit('say-unavailable');
		});
	}

	/**
	 *
	 * Re emits events from `emitter` on `reEmitter`
	 * @param {Object}   emitter   - Emits events to rebroadcast. Has .addListener()
	 * @param {Object}   reEmitter - The object that will rebroadcast. Has .emit()
	 */
	function forwardEvents(emitter, reEmitter) {
		var events = [
			'action', 'chat', 'clearchat', 'connected', 'connecting', 'crash',
			'disconnected', 'hosted', 'hosting', 'slowmode', 'subanniversary',
			'subscriber', 'subscription', 'timeout', 'unhost'
		];
		events.forEach(function(event) {
			emitter.addListener(event, function() {
				var args = Array.prototype.slice.call(arguments);
				args.unshift(event);
				reEmitter.emit.apply(reEmitter, args);
			});
		});
	}

	/**
	 * Makes sure the clients are connected to the
	 * correct channels, the ones in the settings.
	 */
	function syncChannels() {
		[clients.read, clients.write].forEach(function(client) {
			joinChannels(client);
			leaveChannels(client);
		})
	}

	/**
	 * Joins any channels in settings.channels
	 * that haven't been joined yet.
	 */
	function joinChannels(client) {
		settings.channels.forEach(function(channel) {
			console.log('checking if need to join '+channel);
			if (client.currentChannels.indexOf(channel) === -1) {
				client.join(channel);
			}
		});
	}

	/**
	 * Leaves joined channels that do not
	 * appear in settings.channels.
	 */
	function leaveChannels(client) {
		// Need for loop for the index and it's
		// backwards so that array changes don't affect the loop
		for (var i = client.currentChannels.length - 1; i > -1; i--) {
			var channel = client.currentChannels[i];
			if (settings.channels.indexOf(channel) === -1) {
				client.part(channel);
			}
		}
	}

	function destroy(cb) {
		var disconnect = $q.all([clients.read.disconnect(), clients.write.disconnect()]);
		disconnect.then(function() {
			clients.read.removeAllListeners();
			clients.write.removeAllListeners();
			cb();
		});
	}

	function onEitherDisconnect(cb) {
		//noinspection JSCheckFunctionSignatures
		Object.observe(clients, function onUpdate(changes) {
			console.log('IRC: clients object changes:', changes);
			changes.forEach(function(change) {
				var client = clients[change.name];
				console.log('IRC: onEitherDisconnect attaching disconnect listener');
				client.addListener('disconnected', disconnected);
			});
		}, ['update']);

		// callback is fired, no need to listen for disconnect anymore
		// new listeners will be created when new clients are ready
		function disconnected() {
			console.log('IRC: onEtiherDisconnect fired');
			[clients.read, clients.write].forEach(function(client) {
				if (client) client.removeListener('disconnected', disconnected);
			});
			cb();
		}

	}
	
	function onChannelsChange(cb) {
		$rootScope.$watchCollection(
			function watchVal() {return settings.channels;},
			function handler(newV, oldV) {
				if (newV !== oldV) cb();
			}
		);
	}

	function onInvalidCredentials(cb) {
		onCredentialsValidChange(function(valid) {
			if (!valid) cb();
		})
	}

	function onValidCredentials(cb) {
		onCredentialsValidChange(function(valid) {
			if (valid) cb();
		})
	}


	function onCredentialsValidChange(cb) {
		// TODO change this so it doesn't run for each call
		$rootScope.$watch(credentialsValid, function(newv, oldv) {
				if (oldv !== newv) cb(newv);
			}
		);
	}
	
	function credentialsValid() {
		return !!settings.identity.username.length && !!settings.identity.password.length;
	}
	
	return ee;
});