import angular from 'angular'
import template from '../components/settings-panel/settings-gui-dialog.pug'
import '../components/settings-panel/settings-gui-dialog.styl'

angular.module('tc').factory('settingsGui', function ($mdDialog, $rootElement) {
  return {
    /**
     * Shows the options page.
     * @param $event - Angular event used for the enter and exit animations
     */
    show: function ($event) {
      $mdDialog.show({
        parent: $rootElement,
        targetEvent: $event,
        template: template,
        clickOutsideToClose: true,
        controller: function (scope, $mdDialog) {
          scope.close = $mdDialog.hide
        }
      })
    }
  }
})
