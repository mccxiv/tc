var shell = require('shelljs');
var path = require('path');
var gulp = require('gulp');

gulp.task('postinstall', function() {
  shell.exec('bower install --allow-root');
  shell.exec('cd src && npm install --unsafe-perm');
});

gulp.task('reinstall', function() {
  shell.exec('npm prune && npm update');
  shell.rm('-rf', 'src/node_modules');
  shell.rm('-rf', 'src/bower_components');
  shell.exec('npm run postinstall');
});

gulp.task('cleanup', function() {
  shell.mkdir('-p', '_dist');
  shell.mv('dist/win-x64/**', '_dist/');
  shell.rm('-rf', 'dist');
  shell.find('_dist').filter((f) => f.endsWith('.exe')).forEach((f) => {
    shell.mv(f, f.replace('TcSetup', 'tc-setup-windows'));
  });
});