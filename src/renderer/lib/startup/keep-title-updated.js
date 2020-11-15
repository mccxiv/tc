import channels from '../channels'
import store from '../../store'
import capitalize from '../transforms/capitalize'

export default function keepTitleUpdated () {
  update()
  channels.on('change', update)

  function update () {
    const settings = store.settings.state
    let prefix
    const suffix = ' - Tc'
    let channel = settings.channels[settings.selectedTabIndex]
    if (channel) prefix = capitalize(channel)
    else prefix = 'Join channel'
    document.title = prefix + suffix
  }
}
