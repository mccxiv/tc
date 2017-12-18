import getBacklog from '../backlog'
import settings from '../settings/settings'

export default function keepChannelsOnBacklog () {
  const twentyThreeHours = 8.28e+7
  setInterval(grabAll, twentyThreeHours)
}

function grabAll () {
  settings.channels.forEach(c => getBacklog(c))
}
