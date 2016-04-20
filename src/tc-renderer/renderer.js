import './app.css';
import './themes/dark.css';
import './lib/startup/icon-font';
import $ from 'jquery';
//import enableSpellchecker from './startup/enable-spellchecker';
import keepTitleUpdated from './lib/startup/keep-title-updated';
import enableDevTools from './lib/startup/enable-dev-tools';
import changeMacBackgroundColor from './lib/startup/change-mac-background-color';
import enableMenuOnMac from './lib/startup/enable-menu-on-mac';
import preventPageNavigation from './lib/startup/prevent-page-navigation';

import './lib/startup/angular-stuff';

console.log('Welcome to the Developer Console!');
console.log('Technical info and error messages will be displayed here.');
console.log('Red 404 messages can be safely ignored.');

enableDevTools();
keepTitleUpdated();
//enableSpellchecker();
changeMacBackgroundColor();
enableMenuOnMac();
preventPageNavigation();


$('.loader').delay(1400).fadeOut(1000);
$('.app').delay(1400).fadeTo(1000, 1);