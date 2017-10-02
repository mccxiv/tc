import './emote-menu.css';
import angular from 'angular';
import template from './emote-menu.html';
import {getAllCachedEmotes} from '../../../lib/emotes/menu';

angular.module('tc').directive('emoteMenu', () => {
  function link(scope) {
    debugger
    scope.m = {categories: getAllCachedEmotes()}

    scope.selectEmote = function () {
      scope.m.emoteMenu = !scope.m.emoteMenu
    }
  }

  return {restrict: 'E', template, link}
});