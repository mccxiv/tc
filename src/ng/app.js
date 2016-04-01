angular.module('tc', ['ngMaterial', 'ngSanitize']);

setTimeout(function() {
  angular.bootstrap(document, ['tc']);
}, 2400);

$('.loader').delay(4400).fadeOut(1000);
$('.app').delay(4400).fadeTo(1000, 1);