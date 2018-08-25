import './thumbnail.styl'
import which from 'which'
import axios from 'axios'
import {exec} from 'child_process'
import angular from 'angular'
import template from './thumbnail.pug'
import * as api from '../../../lib/api'

angular.module('tc').component('thumbnail', {template, controller})

function controller ($scope, $element, irc, messages, openExternal, settings) {
  const vm = this

  vm.$onInit = () => {
    vm.settings = settings
    vm.img = ''
    vm.channel = null
    vm.stream = null
    vm.hosting = false
    vm.streamlink = false
    vm.livestreamer = false
    vm.loadThumbnailInterval = setInterval(loadThumbnail, 60 * 1000)
    vm.loadHostStatusInterval = setInterval(loadHostStatus, 60 * 1000 * 5)

    vm.host = host
    vm.unhost = unhost
    vm.playTwitch = playTwitch
    vm.playMediaplayer = playMediaplayer

    loadThumbnail()
    loadHostStatus()
    checkStreamlinkInstallation()
    checkLivestreamerInstallation()

    $element.attr('layout', 'column')

    $scope.$watch(
      getChannel,
      () => {
        vm.stream = null
        vm.channel = null
        vm.hosting = false
        loadThumbnail()
        loadHostStatus()
      }
    )
  }

  vm.$onDestroy = () => {
    clearInterval(vm.loadThumbnailInterval)
    clearInterval(vm.loadHostStatusInterval)
  }

  const host = () => {
    irc.say(`#${settings.identity.username}`, `.host ${getChannel()}`)
    messages.addNotification(getChannel(), 'Host command sent.')
    setTimeout(loadHostStatus, 1500)
    setTimeout(loadHostStatus, 4000)
  }

  const unhost = () => {
    irc.say(`#${settings.identity.username}`, '.unhost')
    messages.addNotification(getChannel(), 'Unhost command sent.')
    setTimeout(loadHostStatus, 1500)
    setTimeout(loadHostStatus, 4000)
  }

  const playMediaplayer = audioOnly => {
    const player = vm.streamlink ? 'streamlink' : 'livestreamer'
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

  const playTwitch = () => {
    openExternal(`http://www.twitch.tv/${getChannel()}/popout`)
  }

  const checkStreamlinkInstallation = () => {
    which('streamlink', err => vm.streamlink = !err)
  }

  const checkLivestreamerInstallation = () => {
    which('livestreamer', err => vm.livestreamer = !err)
  }

  const getChannel = () => {
    return settings.channels[settings.selectedTabIndex]
  }

  const loadThumbnail = async () => {
    const channel = getChannel()
    vm.channel = await api.channel(channel)
    vm.stream = (await api.stream(channel)).stream
    if (!vm.stream) return
    const url = vm.stream.preview.medium + '?' + new Date().getTime()
    await preLoadImage(url)
    vm.img = url
    $scope.$digest()
  }

  const loadHostStatus = () => {
    // This task is lower priority than the others, let them run first.
    setTimeout(async () => {
      const user = (irc.getClient() || {}).globaluserstate
      const id = user && user['user-id'] ? user['user-id'] : null
      if (!id) return setTimeout(loadHostStatus, 2000)
      const opts = {params: {host: id, include_logins: 1}}
      const resp = await axios('https://tmi.twitch.tv/hosts', opts)
      if (resp.data && resp.data.hosts[0]) {
        vm.hosting = resp.data.hosts[0].target_login === getChannel()
        $scope.$digest()
      }
    }, 600)
  }

  const preLoadImage = url => {
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
