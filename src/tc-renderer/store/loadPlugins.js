import logStoreChanges from './plugins/log-store-changes'
import keepSettingsUpdated from './plugins/keep-settings-updated-on-disk'

export default function () {
  logStoreChanges()
  keepSettingsUpdated()
}
