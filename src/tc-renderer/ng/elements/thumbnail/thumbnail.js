import './thumbnail.styl'
import which from 'which'
import axios from 'axios'
import {exec} from 'child_process'
import angular from 'angular'
import template from './thumbnail.pug'
import * as api from '../../../lib/api'
import channels from '../../../lib/channels'

angular.module('tc').component('thumbnail', {template, controller})

function controller ($scope, $element, irc, messages, openExternal, settings) {
  const vm = this

  vm.$onInit = () => {
    vm.loadThumbnailInterval = setInterval(loadThumbnail, 60000)
    vm.loadHostStatusInterval = setInterval(loadHostStatus, 60 * 5 * 1000)
    vm.settings = settings
    vm.m = {
      img: '',
      channel: null,
      stream: null,
      hosting: false,
      streamlink: false,
      livestreamer: false
    }

    loadThumbnail()
    loadHostStatus()
    checkStreamlinkInstallation()
    checkLivestreamerInstallation()

    $element.attr('layout', 'column')

    // TODO memory leak
    channels.on('change', () => {
      vm.m.stream = null
      vm.m.channel = null
      vm.m.hosting = false
      loadThumbnail()
      loadHostStatus()
    })
  }

  vm.$onDestroy = () => {
    clearInterval(vm.loadThumbnailInterval)
    clearInterval(vm.loadHostStatusInterval)
  }

  vm.host = () => {
    irc.say(`#${settings.identity.username}`, `.host ${getChannel()}`)
    messages.addNotification(getChannel(), 'Host command sent.')
    setTimeout(loadHostStatus, 1500)
    setTimeout(loadHostStatus, 4000)
  }

  vm.unhost = () => {
    irc.say(`#${settings.identity.username}`, '.unhost')
    messages.addNotification(getChannel(), 'Unhost command sent.')
    setTimeout(loadHostStatus, 1500)
    setTimeout(loadHostStatus, 4000)
  }

  vm.playMediaplayer = audioOnly => {
    const player = vm.m.streamlink ? 'streamlink' : 'livestreamer'
    const type = audioOnly ? 'audio_only' : ''
    const channel = 'twitch.tv/' + getChannel()
    stream(type)

    function stream (quality) {
      const id = '1pr5dzvymq1unqa2xiavdkvslsn4ebe'
      exec(`${player} --http-header Client-ID=${id} ${channel} ${quality}`,
        (err, stdout) => {
          if (!err && stdout) {
            const lastLine = stdout.trim().split('\n').pop()
            if (lastLine.startsWith('Available streams')) {
              stream('best')
            }
          }
        }
      )
    }
  }

  vm.playTwitch = () => {
    openExternal(`http://www.twitch.tv/${getChannel()}/popout`)
  }

  function checkStreamlinkInstallation () {
    which('streamlink', err => vm.m.streamlink = !err)
  }

  function checkLivestreamerInstallation () {
    which('livestreamer', err => vm.m.livestreamer = !err)
  }

  function getChannel () {
    return settings.channels[settings.selectedTabIndex]
  }

  async function loadThumbnail () {
    const channel = getChannel()
    vm.m.channel = await api.channel(channel)
    vm.m.stream = (await api.stream(channel)).stream
    if (!vm.m.stream) return
    const url = vm.m.stream.preview.medium + '?' + new Date().getTime()
    await preLoadImage(url)
    vm.m.img = url
    $scope.$digest()
  }

  function loadHostStatus () {
    // This task is lower priority than the others, let them run first.
    setTimeout(async () => {
      const user = (irc.getClient() || {}).globaluserstate
      const id = user && user['user-id'] ? user['user-id'] : null
      if (!id) return setTimeout(loadHostStatus, 2000)
      const opts = {params: {host: id, include_logins: 1}}
      const resp = await axios('https://tmi.twitch.tv/hosts', opts)
      if (resp.data && resp.data.hosts[0]) {
        vm.m.hosting = resp.data.hosts[0].target_login === getChannel()
        $scope.$digest()
      }
    }, 600)
  }

  async function preLoadImage (url) {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.src = url
      img.addEventListener('load', done)
      img.addEventListener('error', done)

      function done () {
        img.removeEventListener('load', done)
        img.removeEventListener('error', done)
        resolve()
      }
    })
  }
}
