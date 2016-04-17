import angular from 'angular';

/**
 * @ngdoc directive
 * @name hrefExternal
 *
 * @description
 * Reads the href-external attribute and opens the
 * url in the system's default web browser
 */
angular.module('tc').directive('hrefExternal', (openExternal) => {
  return {
    restrict: 'A',
    link: (scope, element, attrs) => {
      element.bind('click', () => {
        let href = attrs.hrefExternal;
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
          href = 'http://' + href;
        }
        openExternal(href);
      });
    }
  };
});