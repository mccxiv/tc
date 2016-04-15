/**
 * Make sure unhandled clicks don't cause weird behaviors like
 * navigating to a different page from inside the app.
 * 
 * TODO test it again
 */
export default () => {
  document.addEventListener('click', function(e) {
    e.preventDefault();
  });
};