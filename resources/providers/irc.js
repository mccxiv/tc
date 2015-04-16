angular.module('tc').factory('irc', ['$rootScope', 'settings', function($rootScope, settings) {

	
	var irc = require('twitch-irc');
	var Emitter = require("events").EventEmitter;
	var credentials = [settings.username, settings.password];
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
				
				console.log('IRC: Rebroadcasting event: '+event);
				console.log('IRC: Rebroadcasting with args', args)
				reEmitter.emit.apply(reEmitter, args);
			});
		});
	}
	
	function makeNewClient() {
		if (credentialsValid()) {
			var clientSettings = {
				identity: {
					username: settings.username,
					password: settings.password
				},
				channels: settings.channels
			};
			
			client = new irc.client(clientSettings);
			forwardEvents(events, client, ee);
			client.connect();
			attachDebuggingListeners();
		}
		else {
			console.log('Aborting creation of client because of invalid credentials');
		}
	}

	function destroyClient() {
		client.disconnect();	
	}
	
	function onChannelsChange(cb) {
		// TODO join and leave channels
	}
	
	function onCredentialsChange(cb) {
		$rootScope.$watch(watchVal, handler); // TODO this is broken, watch collection instead?
		
		function watchVal() {
			return credentials;
		}

		function handler(newV, oldV) {
			if (newV !== oldV) {
				console.log('Credentials changed.');
				cb();
			}
		}
	}
	
	function credentialsValid() {
		return true
		//return !!settings.password.length
	}
	
	function attachDebuggingListeners() {
		client.addListener('chat', function(ch, usr, msg) {
			console.log(ch+' '+usr.username+': '+msg);
		});

		client.addListener('connected', function() {
			console.info('Connected');
		});

		client.addListener('disconnected', function() {
			console.warn('Disconnected');
		});	
	}
	
	return ee;
}]);