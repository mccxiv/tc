import './user-panel.css';
import angular from 'angular';
import template from './user-panel.html';
import {user} from '../../../lib/api';
import settings from '../../../lib/settings/settings';
import capitalize from '../../../lib/transforms/capitalize';

angular.module('tc').directive('userPanel',
  ($document, session, irc, openExternal) => {

  function link(scope) {
    scope.m = {
      created: '',
      profilePicSrc: ''
    };

    // TODO doesn't work
    $document.bind('keypress', (e) => {
      if (!session.inputFocused && scope.shouldDisplay()) {
        switch (String.fromCharCode(e.which)) {
          case 'p': scope.purge();   break;
          case 't': scope.timeout(); break;
          case 'b': scope.ban();     break;
        }
      }
    });

    scope.$watch(
      () => session.selectedUser,
      () => {if (session.selectedUser) fetchUser()}
    );

    scope.capitalize = capitalize;

    scope.amMod = () => {
      const channel = settings.channels[settings.selectedTabIndex];
      return irc.isMod('#' + channel, settings.identity.username);
    };

    /**
     * True when the user was selected in the currently active channel
     * @returns {boolean}
     */
    scope.shouldDisplay = () => {
      const selectedChannel = settings.channels[settings.selectedTabIndex];
      const onThatChannel = session.selectedUserChannel === selectedChannel;
      return session.selectedUser && onThatChannel;
    };

    scope.goToChannel = () => {
      openExternal('http://www.twitch.tv/' + session.selectedUser);
    };

    scope.sendMessage = () => {
      const composeUrl = 'http://www.twitch.tv/message/compose?to=';
      openExternal(composeUrl + session.selectedUser);
    };

    scope.timeout = (seconds) => {
      const toMsg = `.timeout ${session.selectedUser} ${(seconds || 600)}`;
      irc.say(session.selectedUserChannel, toMsg);
      scope.close();
    };

    scope.purge = () => {
      scope.timeout(3);
    };

    scope.ban = () => {
      const banMsg = '.ban ' + session.selectedUser;
      irc.say(session.selectedUserChannel, banMsg);
      scope.close();
    };

    scope.close = () => {
      session.selectedUser = null;
      session.selectedUserChannel = null;
    };

    async function fetchUser() {
      const userData = await user(session.selectedUser);
      scope.m.profilePicSrc = userData.logo ? userData.logo : '';
      scope.m.created = userData.created_at;
      scope.$apply();
    }
  }

  return {restrict: 'E', template, link}
});