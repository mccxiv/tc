import './chat-tabs.css';
import $ from 'jquery';
import angular from 'angular';
import template from './chat-tabs.html';
import settings from '../../../lib/settings';
import channels from '../../../lib/channels';

angular.module('tc').directive('chatTabs', ($timeout, messages) => {

  function link(scope, element) {
    element = $(element[0]);

    scope.settings = settings;
    scope.hidden = {};
    scope.loaded = {};
    scope.readUntil = {};
    element.attr('layout', 'column');

    scope.selected = (channel) => load(channel, true);
    scope.deselected = handleChannelDeselected;
    scope.unread = numberOfUnreadMessages;
    scope.showingAddChannel = isAddTabSelected;

    if (currChannel()) scope.loaded[currChannel()] = true;

    // TODO remove hack. When joining a new channel it won't render unless...
    channels.on('add', () => {
      setTimeout(() => clickTab(settings.channels.length), 10);
      setTimeout(() => clickTab(settings.channels.length - 1), 200);
    });

    function clickTab(index) {
      element.find('md-tab-item').eq(index).click();
    }

    /**
     * Returns how many unread messages a channel has.
     * @param channel
     * @returns {string|number}
     */
    function numberOfUnreadMessages(channel) {
      if (currChannel() === channel) return '';
      var unread = messages(channel).counter - (scope.readUntil[channel] || 0);
      if (!unread) return '';
      if (unread > 100) return '*';
      else return unread;
    }

    function isAddTabSelected() {
      return settings.selectedTabIndex === settings.channels.length;
    }

    function handleChannelDeselected(channel) {
      const lines =  messages(channel);
      load(channel, false);
      hideTemporarily(channel);
      if (lines) scope.readUntil[channel] = lines.counter;
      else delete scope.readUntil[channel]; // Channel was left
    }

    /**
     * The chat-output directive should not be shown and hidden immediately
     * because it's a very CPU intensive operation, let the animations
     * run first then do the heavy DOM manipulation.
     * @param {string} channel
     * @param {boolean} show
     */
    function load(channel, show) {
      //$timeout(loadSync, show? 1000 : 3000);
      loadSync();

      function loadSync() {
        // Abort unload operation if the tab to be hidden is selected again
        if (currChannel() === channel && !show) return;
        if (show) scope.loaded[channel] = true;
        else {
          $timeout(() => {
            if (currChannel() !== channel) {
              delete scope.loaded[channel];
            }
          }, 3000);
        }
      }
    }

    /**
     * Hide the exiting channel first, then remove it from DOM.
     * Removing it immediately uses too much CPU
     * @param {string} channel
     */
    function hideTemporarily(channel) {
      scope.hidden[channel] = true;
      $timeout(() => delete scope.hidden[channel], 1500);
    }

    function currChannel() {
      return settings.channels[settings.selectedTabIndex];
    }
  }

  return {restrict: 'E', template, link}
});