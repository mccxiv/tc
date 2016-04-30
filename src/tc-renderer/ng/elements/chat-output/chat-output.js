import './chat-output.css';
import 'frostyjs/dist/css/frosty.min.css';
import 'imports?jQuery=jquery!frostyjs/dist/js/frosty.min.js';
import throttle from 'lodash.throttle';
import $ from 'jquery';
import angular from 'angular';
import colors from '../../../lib/colors';
import template from './chat-output.html';
import {sleep} from '../../../lib/util';
import {badges} from '../../../lib/api';
import settings from '../../../lib/settings/settings';

angular.module('tc').directive('chatOutput',
  ($sce, $timeout, messages, session, openExternal) => {

  function link(scope, element) {
    element = $(element[0]); scope.$on('$destroy', () => element.off());

    //===============================================================
    // Variables
    //===============================================================
    const e = element[0];
    let fetchingBacklog = false;
    scope.opts = settings.chat;
    scope.badges = null;
    scope.messages = messages(scope.channel);
    scope.autoScroll = () => session.autoScroll;
    session.autoScroll = true;

    //===============================================================
    // Setup
    //===============================================================
    watchUserScrolling();
    scrollWhenTogglingSidebar();
    scrollOnNewMessages();
    scrollOnWindowResize();
    fetchBadges();
    handleAnchorClicks();
    handleEmoteHover();
    requestAnimationFrame(scrollDown);
    delayedScroll(); // Need to rescroll once emotes and badges are loaded

    //===============================================================
    // Directive methods
    //===============================================================
    scope.selectUsername = selectUsername;
    scope.isBroadcaster = isBroadcaster;
    scope.trusted = (html) => $sce.trustAsHtml(html);
    scope.calculateColor = calculateColor;
    scope.scrollDown = scrollDown;

    //===============================================================
    // Functions
    //===============================================================
    function selectUsername(username) {
      session.selectedUser = username;
      session.selectedUserChannel = scope.channel;
    }

    function isBroadcaster(username) {
      return username.toLowerCase() === scope.channel.toLowerCase();
    }

    function delayedScroll() {
      setTimeout(scrollIfEnabled, 300);
      setTimeout(scrollIfEnabled, 600);
      setTimeout(scrollIfEnabled, 1200);
      setTimeout(scrollIfEnabled, 2400);
    }

    function handleEmoteHover() {
      element.on('mouseenter', '.emoticon', (e) => {
        const emoticon = $(e.target);
        let tooltip = emoticon.data('emote-name');
        const description = emoticon.data('emote-description');

        if (description) tooltip += '<br>' + description;
        // TODO memory leak?
        emoticon.frosty({html: true, content: tooltip});
        emoticon.frosty('show');
        emoticon.one('mouseleave', kill);
        setTimeout(kill, 3000);

        function kill() {
          emoticon.frosty('hide');
          emoticon.off();
        }
      });
    }

    function scrollOnWindowResize() {
      window.addEventListener('resize', scrollIfEnabled);
      scope.$on('$destroy', () => {
        window.removeEventListener('resize', scrollIfEnabled);
      });
    }

    /**
     * Turns autoscroll on and off based on user scrolling,
     * resets the max lines when autoscroll is turned back on,
     * shows all lines when scrolling up to the top (infinite scroll)
     */
    function watchUserScrolling() {
      element.on('wheel', throttle(handler, 200));
      window.dfb = distanceFromBottom;

      function handler() {
        setTimeout(() => {
          const before = session.autoScroll;
          session.autoScroll = distanceFromBottom() === 0;
          if (before !== session.autoScroll) scope.$apply();
          if (!session.autoScroll && distanceFromTop() === 0) getMoreBacklog();
        }, 500); // Wait until the scroll has actually happened
      }
    }

    /**
     * Causes ng-repeat to load all chat lines.
     * Makes sure the scrollbar doesn't jump to the
     * top when the new lines are added.
     */
    async function getMoreBacklog() {
      if (fetchingBacklog) return;
      fetchingBacklog = true;
      const old = distanceFromBottom();
      await messages.getMoreBacklog(scope.channel);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollIfEnabled();
          setTimeout(scrollIfEnabled, 101);
          setTimeout(() => fetchingBacklog = false, 40); // Cooldown period
          e.scrollTop += distanceFromBottom() - old;
        });
      });
    }

    function scrollIfEnabled() {
      if (session.autoScroll) scrollDown();
    }

    function scrollDown() {
      session.autoScroll = true;
      e.scrollTop = e.scrollHeight;
      setTimeout(() => e.scrollTop = e.scrollHeight, 0);
    }

    function scrollWhenTogglingSidebar() {
      scope.$watch(
        () => settings.appearance.sidebarCollapsed,
        (a, b) => {if (a !== b) $timeout(scrollIfEnabled, 260)} // Angular sux
      );
    }

    function scrollOnNewMessages() {
      scope.$watchCollection('messages', scrollIfEnabled);
    }

    function distanceFromTop() {
      return Math.floor(e.scrollTop);
    }

    function distanceFromBottom() {
      const distance = e.scrollHeight - e.scrollTop - e.offsetHeight;
      return Math.floor(Math.abs(distance));
    }

    function handleAnchorClicks() {
      element.on('click', 'a', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openExternal(event.target.getAttribute('href'));
        return false;
      });
    }

    async function fetchBadges(attempt) {
      if (attempt) await sleep(2000);
      try {scope.badges = await badges(scope.channel)}
      catch(e) {if (attempt < 5) fetchBadges(attempt + 1)}
      scope.$apply();
    }

    function calculateColor(color) {
      let lightness;
      let colorRegex = /^#[0-9a-f]+$/i;
      if (colorRegex.test(color)) {
        while ((
        (
          colors.calculateColorBackground(color) === 'light' &&
          settings.theme.dark
        ) || (
          colors.calculateColorBackground(color) === 'dark' && !settings.theme.dark
        ))) {
          lightness = colors.calculateColorBackground(color);
          color = colors.calculateColorReplacement(color, lightness);
        }
      }
      return color;
    }
  }

  return {restrict: 'E', link, template, scope: {channel: '='}}
});