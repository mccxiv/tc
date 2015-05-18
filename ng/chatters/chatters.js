angular.module('tc').directive('chatters', function($http, settings, session, api, channelWatcher) {
	
	function link(scope) {
		var forceShowViewers = false;
		var timeout = null;
		
		scope.api = null;

		fetchList();
		setInterval(function() {fetchList();}, 120000);

		channelWatcher.on('change', function() {
			if (!scope.api) timeoutFetch(200);
			else timeoutFetch(2000);
		});

		scope.showViewers = function(force) {
			if (typeof force === 'boolean') forceShowViewers = force;
			if (!scope.api) return false;
			if (scope.api.chatters.viewers.length < 201) return true;
			else return forceShowViewers;
		};

		// TODO not DRY (same function in different files)
		scope.selectUser = function(username) {
			session.selectedUser = username;
			session.selectedUserChannel = scope.channel;
		};
		
		function fetchList() {
			if (!isChannelSelected()) return; // Abort
			console.log('CHATTERS: Getting user list for channel '+scope.channel);
			api.chatters(scope.channel).success(onList).error(onListError);
		}		
		
		function onList(result, status) {
			if (result && result.data && result.data.chatters) {
				scope.api = result.data;
				var chatters = scope.api.chatters;
				scope.api.chatters = {
					staff: chatters.staff,
					admins: chatters.admins,
					global_mods: chatters.global_mods,
					moderators: chatters.moderators,
					viewers: chatters.viewers
				};
				console.log('CHATTERS: Got viewer list for '+scope.channel, result.data);
			}
			else onListError(result, status);
		}
		
		function onListError(result, status) {
			console.warn('NYI Error'); // TODO
		}
		
		function isChannelSelected() {
			return settings.channels[settings.selectedTabIndex] === scope.channel;
		}
		
		function timeoutFetch(duration) {
			clearTimeout(timeout);
			timeout = setTimeout(fetchList, duration);
		}
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/chatters/chatters.html',
		scope: {channel: '='},
		link: link
	}
});