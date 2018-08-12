import './lib/startup/icon-font'
import registerShortcuts from './lib/startup/keybinds'
import keepTitleUpdated from './lib/startup/keep-title-updated'
import enableDevTools from './lib/startup/enable-dev-tools'
import changeMacBackgroundColor from './lib/startup/change-mac-background-color'
import enableMenuOnMac from './lib/startup/enable-menu-on-mac'
import preventPageNavigation from './lib/startup/prevent-page-navigation'
import setupTrayIcon from './lib/startup/tray-icon'
import watchZoomChanges from './lib/startup/app-zoom'
import keepChannelsOnBacklog from './lib/startup/keep-channels-on-backlog'
import joinChannelFromCommand from './lib/startup/commandline'
import setOnTop from './lib/startup/always-on-top'

import './lib/startup/angular-stuff'

import './lib/emotes/menu'

import './app.css'
import './themes/dark.css'

console.log('Welcome to the Developer Console!')
console.log('Technical info and error messages will be displayed here.')
console.log('Red 404 messages can be safely ignored.')

enableDevTools()
registerShortcuts()
keepTitleUpdated()
changeMacBackgroundColor()
enableMenuOnMac()
preventPageNavigation()
setupTrayIcon()
watchZoomChanges()
keepChannelsOnBacklog()
joinChannelFromCommand()
setOnTop()
