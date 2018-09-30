import './side-toolbar.styl'
import angular from 'angular'
import template from './side-toolbar.pug'
import capitalize from '../../../lib/transforms/capitalize'
import autoUpdater from '../../../lib/auto-updater'

angular.module('tc').component('sideToolbar', {template, controller})

function controller ($mdDialog, settingsGui, irc, openExternal, settings) {
  const vm = this
  vm.updateAvailable = false
  vm.hotkey = process.platform === 'darwin' ? '⌘' : 'ctrl'
  vm.irc = irc
  vm.settings = settings
  vm.settingsGui = settingsGui
  vm.capitalize = capitalize

  autoUpdater.on('update-downloaded', () => {
    vm.updateAvailable = true
    vm.$digest()
  })

  vm.channel = () => {
    return vm.settings.selectedTabIndex === vm.settings.channels.length
      ? undefined
      : vm.settings.channels[vm.settings.selectedTabIndex]
  }

  vm.confirmLogout = (event) => {
    let confirm = $mdDialog.confirm()
      .parent(angular.element(document.body))
      .content('Are you sure you want to log out? ' +
        'You will need to re-enter your password.')
      .ok('OK')
      .cancel('Cancel')
      .targetEvent(event)
    confirm._options.clickOutsideToClose = true
    $mdDialog.show(confirm).then(() => {
      vm.settings.identity.password = ''
    })
  }

  vm.leave = () => {
    vm.settings.channels.splice(vm.settings.selectedTabIndex, 1)
  }

  vm.openChannel = () => {
    openExternal('http://www.twitch.tv/' + vm.channel())
  }

  vm.restart = () => autoUpdater.quitAndInstall()

  vm.toggleCollapsed = () => {
    const flipped = !vm.settings.appearance.sidebarCollapsed
    vm.settings.appearance.sidebarCollapsed = flipped
  }

  vm.showingThumbnailButton = () => {
    return vm.channel() && !vm.settings.appearance.thumbnail
  }
}
