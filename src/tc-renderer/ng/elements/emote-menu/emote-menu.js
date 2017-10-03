import './emote-menu.css';
import angular from 'angular';
import template from './emote-menu.html';
import settings from '../../../lib/settings/settings';
import {getAllCachedEmotes} from '../../../lib/emotes/menu';


angular.module('tc').directive('emoteMenu', (session) => {
  function link(scope) {
    scope.m = {categories: getAllCachedEmotes(currChannel())}

    scope.choose = function (emote) {
      const space = session.message ? ' ' : ''
      session.message = `${session.message || ''}${space}${emote}`
      session.input.focus();
    }
  }

  return {restrict: 'E', template, link}
});

function currChannel() {
  return settings.channels[settings.selectedTabIndex];
}