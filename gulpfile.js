const shell = require('shelljs')
const path = require('path')
const gulp = require('gulp')

shell.config.throw = true // Throw on error

gulp.task('dev-watch-files', function (done) {
  shell.rm('-rf', '_build')
  shell.mkdir('_build')
  shell.cp('src/tc-renderer/index.html', '_build/index.html')
  shell.cp('src/package.json', '_build/package.json')
  shell.exec(path.normalize(
    './node_modules/.bin/webpack --mode development --watch'
  ))
  done()
})

gulp.task('dev-launch-electron', function (done) {
  shell.exec(path.normalize(
    './node_modules/.bin/electron --enable-logging ./_build --dev-tools'
  ))
  done()
})

gulp.task('build', function (done) {
  shell.rm('-rf', '_dist')
  shell.mkdir('-p', '_dist')
  shell.rm('-rf', '_build')
  shell.exec(path.normalize('./node_modules/.bin/webpack --mode production'))
  shell.cp('src/tc-renderer/index.html', '_build/index.html')
  shell.cp('src/package.json', '_build/package.json')
  switch (process.platform) {
    case 'win32':
      console.log('\nAttempting to build Windows version.')
      build('windows')
      break
    case 'linux':
      console.log('\nAttempting to build Linux version.')
      build('linux')
      console.log('\nAttempting to build Windows version.')
      console.log('This will fail without Wine installed!')
      build('windows')
      break
    case 'darwin':
      console.log('\nAttempting to build Mac version.')
      build('mac')
      console.log('\nAttempting to build Linux version.')
      build('linux')
      console.log('\nAttempting to build Windows version.')
      build('windows')
      break
  }
  shell.rm('-rf', 'dist')
  done()
})

function build (platform) {
  if (platform === 'windows') {
    shell.exec('npm run dist:windows')
    shell.mv('dist/squirrel-windows/*', '_dist/')
    shell.find('_dist').filter((f) => f.endsWith('.exe')).forEach((f) => {
      shell.mv(f, f.replace('Tc Setup ', 'tc-setup-win-'))
    })
  } else if (platform === 'linux') {
    shell.exec('npm run dist:linux')
    shell.mv('dist/*.AppImage', '_dist/')
    shell.find('_dist').filter((f) => f.endsWith('.AppImage')).forEach((f) => {
      shell.mv(f, f.replace('Tc-', 'tc-linux-').replace('-x86_64', ''))
    })
  } else if (platform === 'mac') {
    shell.exec('npm run dist:mac')
    shell.mv('dist/*.dmg', '_dist/')
    shell.mv('dist/*.zip', '_dist/')
    shell.find('_dist').filter((f) => f.endsWith('.dmg')).forEach((f) => {
      shell.mv(f, f.replace('Tc', 'tc-setup-mac'))
    })
    shell.find('_dist').filter((f) => f.endsWith('.zip')).forEach((f) => {
      const newName = f.replace('-mac', '').replace('Tc', 'tc-mac')
      shell.mv(f, newName)
    })
  }
}
