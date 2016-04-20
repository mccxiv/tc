import channels from '../channels';
import settings from '../settings/settings';
import capitalize from '../transforms/capitalize';

export default function keepTitleUpdated() {
  channels.on('change', () => {
    let prefix;
    const suffix = ' - Tc';
    var channel = settings.channels[settings.selectedTabIndex];
    if (channel) prefix = capitalize(channel);
    else prefix = 'Join channel';
    document.title = prefix + suffix;
  });
}