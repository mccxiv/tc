import './thumbnail.css';
import which from 'which';
import axios from 'axios';
import {exec} from 'child_process';
import angular from 'angular';
import template from './thumbnail.html';
import * as api from '../../../lib/api';
import settings from '../../../lib/settings/settings';
import channels from '../../../lib/channels';

angular.module('tc').directive('thumbnail', (irc, messages, openExternal) => {

  function link(scope, element) {
    const loadThumbnailInterval = setInterval(loadThumbnail, 60000);
    const loadHostStatusInterval = setInterval(loadHostStatus, 60 * 5 * 1000);
    scope.m = {
      img: '',
      channel: null,
      stream: null,
      hosting: false,
      streamlink: false,
      livestreamer: false
    };

    loadThumbnail();
    loadHostStatus();
    checkStreamlinkInstallation();
    checkLivestreamerInstallation();
    
    element.attr('layout', 'column');

    channels.on('change', () => {
      scope.m.stream = null;
      scope.m.channel = null;
      scope.m.hosting = false;
      loadThumbnail();
      loadHostStatus();
    });

    scope.$on('$destroy', cleanup);

    scope.host = () => {
      irc.say(`#${settings.identity.username}`, `.host ${getChannel()}`);
      messages.addNotification(getChannel(), 'Host command sent.');
      setTimeout(loadHostStatus, 1500);
      setTimeout(loadHostStatus, 4000);
    };

    scope.unhost = () => {
      irc.say(`#${settings.identity.username}`, '.unhost');
      messages.addNotification(getChannel(), 'Unhost command sent.');
      setTimeout(loadHostStatus, 1500);
      setTimeout(loadHostStatus, 4000);
    };

    scope.playMediaplayer = audioOnly => {
      const player = scope.m.streamlink ? 'streamlink' : 'livestreamer';
      const type = audioOnly? 'audio' : '';
      const channel = 'twitch.tv/' + getChannel();
      stream(type);

      function stream(quality) {
        const id = '1pr5dzvymq1unqa2xiavdkvslsn4ebe';
        exec(`${player} --http-header Client-ID=${id} ${channel} ${quality}`,
          (err, stdout) => {
            if (!err && stdout) {
              const lastLine = stdout.trim().split('\n').pop();
              if (lastLine.startsWith('Available streams')) {
                stream('best');
              }
            }
          }
        );
      }
    };

    scope.playTwitch = () => {
      openExternal(`http://www.twitch.tv/${getChannel()}/popout`);
    };

    function checkStreamlinkInstallation() {
      which('streamlink', err => scope.m.streamlink = !err);
    }

    function checkLivestreamerInstallation() {
      which('livestreamer', err => scope.m.livestreamer = !err);
    }

    function getChannel() {
      return settings.channels[settings.selectedTabIndex];
    }

    function cleanup() {
      clearInterval(loadThumbnailInterval);
      clearInterval(loadHostStatusInterval);
    }

    async function loadThumbnail() {
      const channel = getChannel();
      scope.m.channel = await api.channel(channel);
      scope.m.stream = (await api.stream(channel)).stream;
      if (!scope.m.stream) return;
      const url = scope.m.stream.preview.medium + '?' + new Date().getTime();
      await preLoadImage(url);
      scope.m.img = url;
      scope.$apply();
    }

    function loadHostStatus() {
      // This task is lower priority than the others, let them run first.
      setTimeout(async () => {
        const user = irc.getClient().globaluserstate;
        const id =  user && user['user-id'] ? user['user-id'] : null;
        if (!id) return setTimeout(loadHostStatus, 2000);
        const opts = {params: {host: id, include_logins: 1}};
        const resp = await axios('https://tmi.twitch.tv/hosts', opts);
        if (resp.data && resp.data.hosts[0]) {
          scope.m.hosting = resp.data.hosts[0].target_login === getChannel();
          scope.$apply();
        }
      }, 600)
    }

    async function preLoadImage(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.addEventListener('load', resolve);
      });
    }
  }

  return {restrict: 'E', template, link}
});