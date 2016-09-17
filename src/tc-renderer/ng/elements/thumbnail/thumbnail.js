import './thumbnail.css';
import which from 'which';
import {exec} from 'child_process';
import angular from 'angular';
import template from './thumbnail.html';
import * as api from '../../../lib/api';
import settings from '../../../lib/settings/settings';
import channels from '../../../lib/channels';

angular.module('tc').directive('thumbnail', (irc, openExternal) => {

  function link(scope, element) {
    const stop = setInterval(load, 60000);
    scope.m = {img: '', channel: null, stream: null, livestreamer: false};

    load();
    checkLivestreamerInstallation();
    
    element.attr('layout', 'column');

    channels.on('change', () => {
      scope.m.stream = null;
      scope.m.channel = null;
      load();
    });

    scope.$on('$destroy', () => clearInterval(stop));

    scope.playLivestreamer = audioOnly => {
      const type = audioOnly? 'audio' : '';
      const channel = 'twitch.tv/' + scope.channel();
      stream(type);

      function stream(quality) {
        const id = '1pr5dzvymq1unqa2xiavdkvslsn4ebe';
        exec(`livestreamer --http-header Client-ID=${id} ${channel} ${quality}`,
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
      openExternal(`http://www.twitch.tv/${scope.channel()}/popout`);
    };

    function checkLivestreamerInstallation() {
      which('livestreamer', err => {
        scope.m.livestreamer = !err;
      });
    }

    function getChannel() {
      return settings.channels[settings.selectedTabIndex];
    }

    async function load() {
      const channel = getChannel();
      scope.m.channel = await api.channel(channel);
      scope.m.stream = (await api.stream(channel)).stream;
      if (!scope.m.stream) return;
      const url = scope.m.stream.preview.medium + '?' + new Date().getTime();
      await preLoadImage(url);
      scope.m.img = url;
      scope.$apply();
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