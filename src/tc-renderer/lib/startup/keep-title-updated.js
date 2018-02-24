import channels from '../channels'
import settings from '../settings/settings'
import capitalize from '../transforms/capitalize'

export default function keepTitleUpdated () {
  update()
  channels.on('change', update)

  function update () {
    let prefix
    const suffix = ' - Tc'
    let channel = settings.channels[settings.selectedTabIndex]
    if (channel) prefix = capitalize(channel)
    else prefix = 'Join channel'
    document.title = prefix + suffix
  }
}
