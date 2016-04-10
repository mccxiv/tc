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
  shell.rm('-rf', '_dist');
  shell.mkdir('-p', '_dist');
  shell.mv('dist/win-x64/**', '_dist/');
  shell.mv('dist/Tc-darwin-x64/*.dmg', '_dist/');
  shell.mv('dist/Tc-darwin-x64/*.zip', '_dist/');
  shell.find('_dist').filter((f) => f.endsWith('.exe')).forEach((f) => {
    shell.mv(f, f.replace('TcSetup', 'tc-setup-windows'));
  });
  shell.find('_dist').filter((f) => f.endsWith('.dmg')).forEach((f) => {
    shell.mv(f, f.replace('Tc', 'tc-setup-mac'));
  });
  shell.find('_dist').filter((f) => f.endsWith('.zip')).forEach((f) => {
    var newName = f.replace('-mac', '').replace('Tc', 'tc-mac');
    shell.mv(f, newName);
  });
  shell.rm('-rf', 'dist');
});