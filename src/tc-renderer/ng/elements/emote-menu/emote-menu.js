import './emote-menu.styl'
import $ from 'jquery'
import angular from 'angular'
import template from './emote-menu.pug'
import {getAllCachedEmotes} from '../../../lib/emotes/menu'

angular.module('tc').component('emoteMenu', {template, controller})

function controller ($element, $timeout, session, settings) {
  const vm = this

  vm.$onInit = () => {
    vm.visible = false
    vm.categories = getAllCachedEmotes(currChannel())
    vm.choose = choose

    handleEmoteHover()
    $timeout(() => vm.visible = true)
  }

  vm.$onDestroy = () => $($element[0]).off()

  const choose = function (emote) {
    const space = session.message ? ' ' : ''
    session.message = `${session.message || ''}${space}${emote} `
    session.input.focus()
  }

  const handleEmoteHover = () => {
    $($element[0]).on('mouseenter', '.emoticon', e => {
      const emoticon = $(e.target)
      let tooltip = emoticon.data('emote-name')
      const description = emoticon.data('emote-description')

      if (description) tooltip += '<br>' + description
      showTooltip(emoticon, tooltip)
    })
  }

  const currChannel = () => settings.channels[settings.selectedTabIndex]

  const showTooltip = (el, content) => {
    el.frosty({html: true, content})
    el.frosty('show')
    el.one('mouseleave', kill)
    setTimeout(kill, 3000)

    function kill () {
      el.frosty('destroy')
      el.off()
    }
  }
}
