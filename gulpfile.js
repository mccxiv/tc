var shell = require('shelljs')
var path = require('path')
var gulp = require('gulp')

shell.config.throw = true // Throw on error

gulp.task('postinstall', function () {
  shell.exec('cd src && npm install')
})

gulp.task('launch', function () {
  shell.rm('-rf', '_build')
  shell.exec(path.normalize('./node_modules/.bin/webpack'))
  shell.cp('src/tc-renderer/index.html', '_build/index.html')
  shell.cp('src/package.json', '_build/package.json')
  shell.exec(path.normalize('./node_modules/.bin/electron --enable-logging ./_build --dev-tools'))
})

gulp.task('reinstall', function () {
  shell.exec('npm prune && npm update')
  shell.rm('-rf', 'src/node_modules')
  shell.exec('npm run postinstall')
})

gulp.task('build', function () {
  shell.rm('-rf', '_dist')
  shell.mkdir('-p', '_dist')
  shell.rm('-rf', '_build')
  shell.exec(path.normalize('./node_modules/.bin/webpack'))
  shell.cp('src/tc-renderer/index.html', '_build/index.html')
  shell.cp('src/package.json', '_build/package.json')
  shell.exec('npm run dist')
  shell.mv('dist/win/**', '_dist/')
  shell.mv('dist/mac/*.dmg', '_dist/')
  shell.mv('dist/mac/*.zip', '_dist/')
  shell.find('_dist').filter((f) => f.endsWith('.exe')).forEach((f) => {
    shell.mv(f, f.replace('Tc Setup ', 'tc-setup-win-'))
  })
  shell.find('_dist').filter((f) => f.endsWith('.dmg')).forEach((f) => {
    shell.mv(f, f.replace('Tc', 'tc-setup-mac'))
  })
  shell.find('_dist').filter((f) => f.endsWith('.zip')).forEach((f) => {
    var newName = f.replace('-mac', '').replace('Tc', 'tc-mac')
    shell.mv(f, newName)
  })
  shell.rm('-rf', 'dist')
})
