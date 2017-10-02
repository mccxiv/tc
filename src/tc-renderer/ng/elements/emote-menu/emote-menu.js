import './emote-menu.css';
import angular from 'angular';
import template from './emote-menu.html';
import {getAllCachedEmotes} from '../../../lib/emotes/menu';

angular.module('tc').directive('emoteMenu', (session) => {
  function link(scope) {
    scope.m = {categories: getAllCachedEmotes()}

    scope.choose = function (emote) {
      const space = session.message ? ' ' : ''
      session.message = `${session.message || ''}${space}${emote}`
    }
  }

  return {restrict: 'E', template, link}
});