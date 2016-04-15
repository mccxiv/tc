/**
 * Provides the tmi.js library
 *
 * @ngdoc factory
 * @name tmi
 */
angular.module('tc').factory('tmi', function() {
  var tmi = require('tmi.js');
  if (typeof tmi.client !== 'function') {
    console.warn('Node tmi.js thinks we\'re in the browser.');
    console.warn('Using workaround...');
    tmi = window.irc;
  }
  return tmi;
});