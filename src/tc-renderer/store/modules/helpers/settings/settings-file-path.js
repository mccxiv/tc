import path from 'path'
import electron from 'electron'

export const settingsFilePath = path.resolve(
  electron.remote.app.getPath('userData'),
  'settings.json'
)
