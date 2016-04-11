import './app.css';
import './themes/dark.css';
import './startup/icon-font';
import $ from 'jquery';
//import enableSpellchecker from './startup/enable-spellchecker';
import enableDevTools from './startup/enable-dev-tools';
import changeMacBackgroundColor from './startup/change-mac-background-color';
import enableMenuOnMac from './startup/enable-menu-on-mac';
import preventPageNavigation from './startup/prevent-page-navigation';

import './startup/angular-stuff';

console.log('Welcome to the Developer Console!');
console.log('Technical info and error messages will be displayed here.');
console.log('Red 404 messages can be safely ignored.');

enableDevTools();
//enableSpellchecker();
changeMacBackgroundColor();
enableMenuOnMac();
preventPageNavigation();


$('.loader').delay(1400).fadeOut(1000);
$('.app').delay(1400).fadeTo(1000, 1);