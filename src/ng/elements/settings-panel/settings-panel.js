/**
 * Displays the application's options pages
 *
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('settingsPanel', function (settings, autoUpdater, manifest, highlights, notifications) {
  function link(scope, element) {
    element.attr('layout', 'row');
    scope.settings = settings;
    scope.m = {
      version: manifest.version,
      selected: 'highlights'
    };

    scope.highlights = {
      list: highlights.get(),
      input: '',
      highlightMe: highlights.highlightMe(),
      add: function () {
        if (this.input.length) {
          this.list.push(this.input);
          this.save();
        }
        this.input = '';
      },
      remove: function (index) {
        this.list.splice(index, 1);
        this.save();
      },
      changeHighlightMe: function () {
        highlights.highlightMe(this.highlightMe);
      },
      save: function () {
        highlights.set(this.list);
      }
    };

    scope.notifications = {
      playSound: function () {
        if (settings.notifications.soundOnMention) {
          notifications.playSound();
        }
      }
    };

    autoUpdater.checkForUpdates();

    scope.zoomLabel = function () {
      if (settings.appearance.zoom === 100) return 'Normal';
      return settings.appearance.zoom + '%';
    };

    scope.ignore = {
      input: '',
      add: function () {
        var username = this.input.trim().toLowerCase();
        var isNotIgnored = settings.chat.ignored.indexOf(username) < 0;
        var isNotBlank = this.input.length;
        if (isNotBlank && isNotIgnored) settings.chat.ignored.push(username);
        this.input = '';
      },
      delete: function (index) {
        settings.chat.ignored.splice(index, 1);
      }
    };
  }

  return {
    restrict: 'E',
    templateUrl: 'ng/elements/settings-panel/settings-panel.html',
    link: link
  }
});