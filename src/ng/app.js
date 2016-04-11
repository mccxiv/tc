//import 'app.css';

console.log('Welcome to the Developer Console!');
console.log('Technical info and error messages will be displayed here.');
console.log('Red 404 messages can be safely ignored.');

angular.module('tc', ['ngMaterial', 'ngSanitize']);

$('.loader').delay(1400).fadeOut(1000);
$('.app').delay(1400).fadeTo(1000, 1);