/**
 * Server I/O
 *
 * Provides a way to interact with the Twitch chat servers
 * Communication is done with the IRC protocol but over webSockets, via tmi.js.
 *
 * @ngdoc factory
 * @name irc
 * @type {object}
 *
 * @fires irc#tmi-events                  - Rebroadcasts events from tmi.js
 *
 * @property {boolean} ready              - True if connected to the server
 * @property {boolean} badLogin           - True if currently disconnected because of credentials
 *
 * @property {function} say               - Send a message to the server
 * @property {function} whisper           - Send a whisper to the server
 * @property {function} isMod             - Check if a user is a mode in a channel
 * @property {function} credentialsValid  - Returns true if the credentials appear valid. Not verified server side
 */
angular.module('tc').factory('irc', function($rootScope, $timeout, $q, settings, tmi, _) {
	console.log('LOAD: irc');

	//===============================================================
	// Variables
	//===============================================================
	var Emitter = require('events').EventEmitter;
	var ee = new Emitter();
	var clients = {read: null, write: null, whisper: null};

	//===============================================================
	// Public members
	//===============================================================
	ee.ready = false;
	ee.badLogin = false;
	ee.credentialsValid = credentialsValid;

	ee.isMod = function(channel, username) {
		return clients.write.isMod(channel, username);
	};

	ee.say = function(channel, message) {
		clients.write.say(channel, message);
	};

	ee.whisper = function(username, message) {
		clients.whisper.whisper(username, message);
	};

	// TODO debug stuff
	window.ircFactory = ee;
	window.clients = clients;
	window.$rootScope = $rootScope;

	//===============================================================
	// Setup
	//===============================================================
	if (credentialsValid()) create();

	onBadLogin(destroy);
	onValidCredentials(create);
	onInvalidCredentials(destroy);
	onChannelsChange(syncChannels);

	//===============================================================
	// Private methods
	//===============================================================

	function create() {
		console.log('IRC: Creating clients.');
		destroy();
		ee.badLogin = false;

		// Disconnected is handled elsewhere
		var readEvents = [
			'action', 'chat', 'clearchat', 'connected', 'connecting', 'crash',
			'emotesets', 'hosted', 'hosting', 'notice', 'slowmode', 'subanniversary',
			'subscriber', 'subscription', 'timeout', 'unhost'
		];

		var clientSettings = {
			options: {debug: false},
			connection: {cluster: 'aws', timeout: 20000, reconnect: true},
			identity: angular.copy(settings.identity),
			channels: settings.channels.map(function(channel) {
				return '#'+channel;
			})
		};

		_.forEach(clients, function(v, key) {
			var setts = angular.copy(clientSettings);
			if (key === 'whisper') {
				setts.connection.cluster = 'group';
				setts.connection.reconnect = false;
				delete setts.channels;
			}
			clients[key] = new tmi.client(setts);
			clients[key].connect();
		});

		forwardEvents(clients.read, ee, readEvents);
		forwardEvents(clients.whisper, ee, ['whisper']);

		clients.read.on('disconnected', function(reason) {
			console.log('IRC: disconnected:', reason);
			if (reason === 'Login unsuccessful.') {
				ee.badLogin = reason;
				settings.identity.password = '';
			}
			ee.ready = false;
			setTimeout(function() {$rootScope.$apply();}, 0);
		});

		// TODO should wait for write to be connected before being ready
		console.log('IRC: registering connected event');
		clients.read.on('connected', function() {
			console.log('IRC: connected event fired');
			ee.ready = true;
			setTimeout(function() {$rootScope.$apply();}, 0);
		});

		// Disconnected event gets spammed on every connection
		// attempt. This is not ok if the internet is temporarily
		// down, for example.
		onlyEmitDisconnectedOnce();

		function onlyEmitDisconnectedOnce() {
			clients.read.once('disconnected', function() {
				var args = Array.prototype.slice.call(arguments);
				args.unshift('disconnected');
				ee.emit.apply(ee, args);
				clients.read.once('connected', onlyEmitDisconnectedOnce);
			});
		}

		// Temporary monkey patch for reconnect not working with group servers.
		// Periodically check if it's disconnected and manually reconnect.
		setTimeout(reconnectWhisperServer, 60000);
		function reconnectWhisperServer() {
			if (clients.whisper && clients.read) {
				var whisperState = clients.whisper.readyState();
				var readState = clients.read.readyState();
				if (readState === 'OPEN' && whisperState === 'CLOSED') {
					console.warn(
							'Whisper server was disconnected even ' +
							'though the read server is connected. ' +
							'Reconnecting it...');
					clients.whisper.disconnect().then(
							clients.whisper.connect.bind(clients.whisper),
							clients.whisper.connect.bind(clients.whisper)
					);
				}
				setTimeout(reconnectWhisperServer, 20000);
			}
		}
	}

	function destroy() {
		console.log('IRC: destroy');
		_.forEach(clients, function(client, key) {
			if (client) {
				client.removeAllListeners();
				client.disconnect();
				clients[key] = null;
			}
		});
	}

	/**
	 * Re emits events from `emitter` on `reEmitter`
	 * @param {Object}   emitter   - Emits events to rebroadcast. Has .addListener()
	 * @param {Object}   reEmitter - The object that will rebroadcast. Has .emit()
	 * @param {String[]} events    - The events to listen for on `emitter`
	 */
	function forwardEvents(emitter, reEmitter, events) {
		console.log('IRC: Forwarding events:', events);
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
		console.log('IRC: Syncing channels:');
		[clients.read, clients.write].forEach(function(client) {
			joinChannels(client);
			leaveChannels(client);
		});
	}

	/**
	 * Joins any channels in settings.channels
	 * that haven't been joined yet.
	 */
	function joinChannels(client) {
		console.log('IRC: Joining channels:');
		settings.channels.forEach(function(channel) {
			var joined = client.getChannels();
			joined = joined.map(stripHash);
			console.log('IRC: joined channels:', joined);
			console.log('IRC: checking if need to join '+channel);
			if (joined.indexOf(channel) === -1) {
				client.join(channel);
			}
		});
	}

	/**
	 * Leaves joined channels that do not
	 * appear in settings.channels.
	 */
	function leaveChannels(client) {
		console.log('IRC: Leaving channels:');
		var joined = client.getChannels();
		joined = joined.map(stripHash);
		joined.forEach(function(channel) {
			if (settings.channels.indexOf(channel) === -1) {
				client.part(channel);
			}
		});
	}

	/**
	 * When a client disconnects due to unsuccessful login,
	 * sets ee.badLogin and deletes the password from settings.
	 * This should cause the login form to display with an error.
	 * Uses observers to attach this behavior to future client instances.
	 */
	function onBadLogin(cb) {

		if (clients.read) attachBadLoginCheck();

		//noinspection JSCheckFunctionSignatures
		Object.observe(clients, function(changes) {
			changes.forEach(function(change) {
				if (change.name === 'read') attachBadLoginCheck();
			});
		}, ['update']);

		function attachBadLoginCheck() {
			if (!clients.read) return;
			clients.read.on('disconnected', function(reason) {
				if (reason === 'Login unsuccessful.') {
					ee.badLogin = reason;
					settings.identity.password = '';
					setTimeout(function() {$rootScope.$apply();}, 0);
					cb();
				}
			});
		}
	}

	function onChannelsChange(cb) {
		console.log('IRC: onChannelsChange');
		window.test = "!!!";
		$rootScope.$watchCollection(
			function watchVal() {return settings.channels;},
			function handler(newV, oldV) {
				if (newV !== oldV) cb();
			}
		);
	}

	function onInvalidCredentials(cb) {
		console.log('IRC: onInvalidCredentials');
		onCredentialsValidChange(function(valid) {
			if (!valid) cb();
		});
	}

	function onValidCredentials(cb) {
		console.log('IRC: onValidCredentials');
		onCredentialsValidChange(function(valid) {
			console.log('IRC: Checking if credentials are valid: ', valid);
			if (valid) cb();
		});
	}

	function onCredentialsValidChange(cb) {
		console.log('IRC: onCredentialsValidChange');
		// TODO change this so it doesn't run for each call
		$rootScope.$watch(credentialsValid, function(newv, oldv) {
				if (oldv !== newv) cb(newv);
		});
	}

	function stripHash(string) {
		if (string.charAt(0) !== '#') return string;
		else return string.substring(1);
	}

	function credentialsValid() {
		return !!settings.identity.username.length && !!settings.identity.password.length;
	}

	return ee;
});