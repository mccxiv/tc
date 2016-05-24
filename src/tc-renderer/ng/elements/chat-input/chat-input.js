import './chat-input.css';
import angular from 'angular';
import template from './chat-input.html';
import replacePhrases from '../../../lib/transforms/replace-phrases';
import settings from '../../../lib/settings/settings';
import emotesFfz from '../../../lib/emotes/ffz';
import emotesBttv from '../../../lib/emotes/bttv';

angular.module('tc').directive('chatInput',
  (session, irc, messages, emotesTwitch) => {

  function link(scope, element) {
    scope.session = session;
    scope.irc = irc;
    const input = element.find('input')[0];
    session.input = input; // TODO make a better system
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
      if (!channel || !session.message.trim().length) return;

      if (/^\/shrug$/.test(session.message)) {
        irc.say(channel, '¯\\_(ツ)_/¯');
      }

      if (session.message.charAt(0) === '/') {
        session.message = '.' + session.message.substr(1);
      }

      if (session.message.indexOf('.w') === 0) {
        var words = session.message.split(' ');
        var username = words[1];
        var message = words.slice(2).join(' ');
        irc.whisper(username, message);
        messages.addWhisper(settings.identity.username, username, message);
      }

      else irc.say(channel, session.message);

      session.message = '';
    };

    scope.change = function() {
      const msg = session.message;
      if (msg === '/r ') {
        if (lastWhisperer) session.message = `/w ${lastWhisperer} `;
        else session.message = '/w ';
      }

      else if (msg.startsWith('/') || msg.endsWith(':')) {
        session.message = replacePhrases(msg);
      }
    };
  }

  return {restrict: 'E', template, link}
});