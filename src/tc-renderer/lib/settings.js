import path from 'path';
import electron from 'electron';
import angular from 'angular';
import jsonFile from 'jsonfile';
import validateSettings from './validate-settings';
import 'proxy-observe';

const rawSettingsObject = validateSettings(loadSettings());
const settings = Object.deepObserve(rawSettingsObject, saveSettings);

/*angular.module('tc').factory('settings', () => {
  return settings;
});*/

function loadSettings() {
  let s;
  try {s = jsonFile.readFileSync(settingsFilePath())}
  catch (e) {s = loadSettingsFromLocalstorageInstead()}
  return s;
}

function loadSettingsFromLocalstorageInstead() {
  let s = localStorage.settings || {};
  if (typeof s === 'string') {
    try {s = JSON.parse(s)}
    catch (e) {s = {}}
  }
  return s;
}

function saveSettings() {
  jsonFile.writeFileSync(settingsFilePath(), settings, {spaces: 2});
}

function settingsFilePath() {
  const userData = electron.remote.app.getPath('userData');
  return path.resolve(userData, 'settings.json');
}

export default settings;