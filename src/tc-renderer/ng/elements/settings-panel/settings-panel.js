import './settings-panel.css';
import angular from 'angular';
import electron from 'electron';
import template from './settings-panel.html';
import settings from '../../../lib/settings/settings';
import replacements from '../../../lib/data/replacements.json';
import autoUpdater from '../../../lib/auto-updater';

angular.module('tc').directive('settingsPanel', (highlights, notifications) => {
  function link(scope, element) {
    element.attr('layout', 'row');
    scope.settings = settings;
    scope.m = {
      version: electron.remote.app.getVersion(),
      selected: 'tc'
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

    scope.shortcuts = {
      defaults: replacements,
      customs: settings.shortcuts,
      new: {
        name: '',
        value: ''
      },
      newOnKey($event) {
        if ($event.which === 13) {
          const name = this.new.name.trim().toLowerCase();
          const value = this.new.value.trim();
          if (!name || !value) return;
          settings.shortcuts[name] = value;
          this.new.name = '';
          this.new.value = '';
        }
      },
      existingOnKey($event, name) {
        if ($event.which === 13) this.checkDelete(name);
      },
      checkDelete(name) {
        if (!settings.shortcuts[name].trim()) {
          delete settings.shortcuts[name];
        }
      },
      haveCustoms() {
        return Object.keys(settings.shortcuts).length > 0;
      }
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