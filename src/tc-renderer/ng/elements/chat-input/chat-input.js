import './chat-input.css';
import angular from 'angular';
import template from './chat-input.html';
import settings from '../../../lib/settings/settings';
import emotesFfz from '../../../lib/emotes/ffz';
import emotesBttv from '../../../lib/emotes/bttv';

angular.module('tc').directive('chatInput',
  (session, irc, messages, emotesTwitch) => {

  function link(scope, element) {
    scope.message = '';
    scope.session = session;
    scope.irc = irc;
    const input = element.find('input')[0];
    let lastWhisperer;

    irc.on('whisper', (from) => lastWhisperer = from.username);

    // Monkey patch for broken ng-class.
    // See issue #174
    scope.$watch(
      () => irc.ready,
      () => {
        const inputContainer = element.find('md-input-container')[0];
        if (!irc.ready) inputContainer.classList.add('disabled');
        else inputContainer.classList.remove('disabled');
      }
    );

    scope.getAutoCompleteStrings = () => {
      var channel = settings.channels[settings.selectedTabIndex];
      if (!channel) return [];
      else {
        const usernames = messages(channel).filter(hasUser).map(getNames).filter(dedupe);
        const bttvEmotes = grabEmotes(emotesBttv(channel)).sort();
        const ffzEmotes = grabEmotes(emotesFfz(channel)).sort();
        const twitchEmotes = grabEmotes(emotesTwitch).sort();
        return [].concat(twitchEmotes, bttvEmotes, ffzEmotes, usernames);
      }

      function grabEmotes(arr) {
        return arr.map((e) => e.emote);
      }

      function hasUser(message) {
        return !!message.user || !!message.from;
      }

      function dedupe(x, i, array) {
        return array.indexOf(x) === i;
      }

      function getNames(message) {
        return message.from ||
          message.user['display-name'] ||
          message.user.username;
      }
    };

    scope.input = () => {
      var channel = settings.channels[settings.selectedTabIndex];
      if (!channel || !scope.message.trim().length) return;

      if (/\/shrug$/.test(scope.message)) {
        irc.say(channel, '¯\\_(ツ)_/¯');
      }

      if (/\/lenny$/.test(scope.message)) {
        irc.say(channel, '( ͡° ͜ʖ ͡°)');
      }

      if (/\/donger$/.test(scope.message)) {
        irc.say(channel, 'ヽ༼ຈل͜ຈ༽ﾉ');
      }

      if (scope.message.charAt(0) === '/') {
        scope.message = '.' + scope.message.substr(1);
      }

      if (scope.message.indexOf('.w') === 0) {
        var words = scope.message.split(' ');
        var me = {username: settings.identity.username};
        var username = words[1];
        var message = words.slice(2).join(' ');
        irc.whisper(username, message);
        messages.addWhisper(me, username, message);
      }

      else irc.say(channel, scope.message);

      scope.message = '';
    };

    scope.change = function() {
      if (scope.message === '/r ') {
        if (lastWhisperer) scope.message = '/w ' + lastWhisperer + ' ';
        else scope.message = '/w ';
      }
    };
  }

  return {restrict: 'E', template, link}
});