import './settings-panel.css';
import angular from 'angular';
import electron from 'electron';
import template from './settings-panel.html';
import settings from '../../../lib/settings/settings';
import autoUpdater from '../../../lib/auto-updater';

angular.module('tc').directive('settingsPanel', (highlights, notifications) => {
  function link(scope, element) {
    element.attr('layout', 'row');
    scope.settings = settings;
    scope.m = {
      version: electron.remote.app.getVersion(),
      selected: 'highlights'
    };

    scope.highlights = {
      list: highlights.get(),
      input: '',
      highlightMe: highlights.highlightMe(),
      add() {
        if (this.input.length) {
          this.list.push(this.input);
          this.save();
        }
        this.input = '';
      },
      remove(index) {
        this.list.splice(index, 1);
        this.save();
      },
      changeHighlightMe() {highlights.highlightMe(this.highlightMe)},
      save() {highlights.set(this.list)}
    };

    scope.notifications = {
      playSound() {
        if (settings.notifications.soundOnMention) notifications.playSound();
      }
    };

    autoUpdater.checkForUpdates();

    scope.zoomLabel = () => {
      if (settings.appearance.zoom === 100) return 'Normal';
      return settings.appearance.zoom + '%';
    };

    scope.ignore = {
      input: '',
      add() {
        var username = this.input.trim().toLowerCase();
        var isNotIgnored = settings.chat.ignored.indexOf(username) < 0;
        var isNotBlank = this.input.length;
        if (isNotBlank && isNotIgnored) settings.chat.ignored.push(username);
        this.input = '';
      },
      delete(index) {settings.chat.ignored.splice(index, 1)}
    };
  }

  return {restrict: 'E', template, link}
});