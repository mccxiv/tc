/**
 * Make sure unhandled clicks don't cause weird behaviors like
 * navigating to a different page from inside the app.
 */
angular.module('tc').run(function ($rootElement) {
  $rootElement.bind('click', function (e) {
    e.preventDefault();
  });
});