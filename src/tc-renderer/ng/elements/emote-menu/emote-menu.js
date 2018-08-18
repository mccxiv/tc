import './emote-menu.styl'
import $ from 'jquery'
import angular from 'angular'
import template from './emote-menu.pug'
import {getAllCachedEmotes} from '../../../lib/emotes/menu'

angular.module('tc').directive('emoteMenu', ($timeout, session, settings) => {
  function link (scope, element) {
    scope.m = {
      visible: false,
      categories: getAllCachedEmotes(currChannel())
    }

    handleEmoteHover()
    $timeout(() => scope.m.visible = true)

    scope.choose = function (emote) {
      const space = session.message ? ' ' : ''
      session.message = `${session.message || ''}${space}${emote} `
      session.input.focus()
    }

    function handleEmoteHover () {
      $(element[0]).on('mouseenter', '.emoticon', e => {
        const emoticon = $(e.target)
        let tooltip = emoticon.data('emote-name')
        const description = emoticon.data('emote-description')

        if (description) tooltip += '<br>' + description
        showTooltip(emoticon, tooltip)
      })
    }

    function currChannel () {
      return settings.channels[settings.selectedTabIndex]
    }

    function showTooltip (el, content) {
      el.frosty({html: true, content})
      el.frosty('show')
      el.one('mouseleave', kill)
      setTimeout(kill, 3000)

      function kill () {
        el.frosty('hide')
        el.off()
      }
    }
  }

  return {restrict: 'E', template, link, scope: {}}
})
