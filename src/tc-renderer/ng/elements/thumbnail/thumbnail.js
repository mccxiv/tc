import './thumbnail.css';
import angular from 'angular';
import template from './thumbnail.html';
import * as api from '../../../lib/api';
import settings from '../../../lib/settings/settings';
import channels from '../../../lib/channels';

angular.module('tc').directive('thumbnail', (irc, openExternal) => {

  function link(scope, element) {
    const stop = setInterval(load, 60000);
    scope.m = {img: '', channel: null, stream: null};

    load();
    element.attr('layout', 'column');

    channels.on('change', () => {
      scope.m.stream = null;
      scope.m.channel = null;
      load();
    });

    scope.$on('$destroy', () => clearInterval(stop));

    scope.openStream = () => {
      openExternal(`http://www.twitch.tv/${scope.channel()}/popout`);
    };

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