const shell = require('shelljs')
const path = require('path')
const gulp = require('gulp')

shell.config.throw = true // Throw on error

gulp.task('dev-watch-files', function () {
  shell.rm('-rf', '_build')
  shell.mkdir('_build')
  shell.cp('src/tc-renderer/index.html', '_build/index.html')
  shell.cp('src/package.json', '_build/package.json')
  shell.exec(path.normalize(
    './node_modules/.bin/webpack --mode development --watch'
  ))
})

gulp.task('dev-launch-electron', function () {
  shell.exec(path.normalize(
    './node_modules/.bin/electron --enable-logging ./_build --dev-tools'
  ))
})

gulp.task('build', function () {
  shell.rm('-rf', '_dist')
  shell.mkdir('-p', '_dist')
  shell.rm('-rf', '_build')
  shell.exec(path.normalize('./node_modules/.bin/webpack --mode production'))
  shell.cp('src/tc-renderer/index.html', '_build/index.html')
  shell.cp('src/package.json', '_build/package.json')
  console.log('Trying to build for Linux, it will fail on Windows')
  shell.exec('npm run dist:linux')
  console.log('Trying to build for Mac, it will fail unless on Mac')
  shell.exec('npm run dist:mac')
  console.log('Trying to build for Windows, it might fail without Wine')
  shell.exec('npm run dist:windows')
  shell.mv('dist/squirrel-windows/**', '_dist/')
  shell.mv('dist/*.dmg', '_dist/')
  shell.mv('dist/*.zip', '_dist/')
  shell.mv('dist/*.AppImage', '_dist/')
  shell.find('_dist').filter((f) => f.endsWith('.exe')).forEach((f) => {
    shell.mv(f, f.replace('Tc Setup ', 'tc-setup-win-'))
  })
  shell.find('_dist').filter((f) => f.endsWith('.dmg')).forEach((f) => {
    shell.mv(f, f.replace('Tc', 'tc-setup-mac'))
  })
  shell.find('_dist').filter((f) => f.endsWith('.zip')).forEach((f) => {
    const newName = f.replace('-mac', '').replace('Tc', 'tc-mac')
    shell.mv(f, newName)
  })
  shell.find('_dist').filter((f) => f.endsWith('.AppImage')).forEach((f) => {
    shell.mv(f, f.replace('Tc-', 'tc-linux-').replace('-x86_64', ''))
  })
  shell.rm('-rf', 'dist')
})
