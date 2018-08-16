import path from 'path'
import {EventEmitter} from 'events'
import angular from 'angular'
import electron from 'electron'
import jsonFile from 'jsonfile'
import {getValidatedSettings} from './validate-settings'
import 'proxy-observe'

const events = new EventEmitter()
const settings = getValidatedSettings(loadSettings())
const nonProxiedSettings = JSON.parse(JSON.stringify(settings))
Object.deepObserve(settings, (...args) => {
  events.emit('change', ...args)
  saveSettings()
})

function loadSettings () {
  let s
  try {
    s = jsonFile.readFileSync(settingsFilePath())
  } catch (e) {
    s = loadSettingsFromLocalstorageInstead()
  }
  return s
}

function loadSettingsFromLocalstorageInstead () {
  let s = window.localStorage.settings || {}
  if (typeof s === 'string') {
    try { s = JSON.parse(s) } catch (e) { s = {} }
  }
  return s
}

function saveSettings () {
  jsonFile.writeFileSync(settingsFilePath(), settings, {spaces: 2})
  safeApply()
}

function settingsFilePath () {
  const userData = electron.remote.app.getPath('userData')
  return path.resolve(userData, 'settings.json')
}

function safeApply () {
  const rootAppElement = document.querySelector('[ng-app]')
  const $scope = angular.element(rootAppElement).injector().get('$rootScope')
  if (!$scope.$$phase) $scope.$apply()
}

export default settings

export {nonProxiedSettings}

export {events}
