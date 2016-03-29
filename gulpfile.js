var del =             require('del');
var exec =            require('child_process').exec;
var gulp =            require('gulp');
var path =            require('path');
var useref =          require('gulp-useref');
var uglify =          require('gulp-uglify');
var gulpif =          require('gulp-if');
var concat =          require('gulp-concat');
var rebuild =         require('electron-rebuild');
var addsrc =          require('gulp-add-src');
var base64 =          require('gulp-css-base64');
var packager =        require('electron-packager');
var minifyCss =       require('gulp-minify-css');
var stripDebug =      require('gulp-strip-debug');
var ngAnnotate =      require('gulp-ng-annotate');
var runSequence =     require('run-sequence');
var winInstaller =    require('electron-windows-installer');
var templateCache =   require('gulp-angular-templatecache');

var VERSION = require('root-require')('src/package.json').version;
var BUILD_DIR = '_build';
var PACKAGED_DIR = '_packaged';
var DIST_DIR = '_dist';

if (typeof VERSION !== 'string' || VERSION.length < 5) {
	throw new Error('Invalid version from package.json');
}

gulp.task('default', ['make-dist']);

gulp.task('run-dev', function(cb) {
	exec(path.normalize('./node_modules/.bin/electron ./src --dev-tools'), cb);
});

gulp.task('run-dev-no-args', function(cb) {
	exec(path.normalize('./node_modules/.bin/electron ./src'), cb);
});

gulp.task('make-dist', function(cb) {
	runSequence(
		'clean-before',
		'rebuild-spellchecker-ia32',
		[
			'copy-lib',
			'copy-assets',
			'copy-electron-files',
			'copy-node-modules'
		],
		'cache-templates',
		'build-html',
		'clean-cached-templates',
		'package',
		'remove-unnecessary-package-files',
		'make-windows-installer',
		//'clean-after',
		'rebuild-spellchecker',
		cb
	);
});

gulp.task('clean-before', function(cb) {
	del([BUILD_DIR, PACKAGED_DIR, DIST_DIR], cb);
});

gulp.task('rebuild-spellchecker-ia32', function() {
	/*exec(path.normalize('./node_modules/.bin/electron-rebuild ' +
		'--module-dir src/node_modules ' +
		'--which-module spellchecker ' +
		'--arch ia32 '
	), cb);*/

  return rebuild.installNodeHeaders('v0.34.2', undefined, undefined, 'ia32')
      .then(function() {
        rebuildNativeModules('v0.34.2', './src/node_modules')
      });
});

gulp.task('rebuild-spellchecker', function(cb) {
	exec(path.normalize('./node_modules/.bin/electron-rebuild ' +
		'--module-dir src/node_modules ' +
		'--which-module spellchecker '
	), cb);
});

gulp.task('copy-lib', function() {
	return gulp.src('src/lib/**/*')
		.pipe(gulp.dest(BUILD_DIR + '/lib/'));
});

gulp.task('copy-assets', function() {
	return gulp.src('src/assets/**/*')
		.pipe(gulp.dest(BUILD_DIR + '/assets/'));
});

gulp.task('copy-electron-files', function() {
	return gulp.src(['src/index.js', 'src/package.json'])
		.pipe(gulp.dest(BUILD_DIR));
});

gulp.task('copy-node-modules', function () {
	return gulp.src(
		['src/node_modules/**/*', '!src/node_modules/.bin'],
		{base: 'src/node_modules'})
		.pipe(gulp.dest(BUILD_DIR + '/node_modules/'));
});

gulp.task('cache-templates', function() {
	return gulp.src('src/ng/**/*.html')
		.pipe(templateCache({module: 'tc', root: 'ng'}))
		.pipe(gulp.dest(BUILD_DIR + '/temp/'));
});

gulp.task('build-html', function() {
	var assets = useref.assets({noconcat: true});
	return gulp.src('src/index.html')
		.pipe(assets)
		.pipe(addsrc.append(BUILD_DIR + '/temp/templates.js'))
		.pipe(gulpif('*.js', concat('app.js')))
		.pipe(gulpif('*.js', ngAnnotate()))
		.pipe(gulpif('*.js', stripDebug()))
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', base64({maxWeightResource: Infinity})))
		.pipe(gulpif('*.css', concat('style.css')))
		.pipe(gulpif('*.css', minifyCss()))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest(BUILD_DIR));
});

gulp.task('clean-cached-templates', function(cb) {
	del([BUILD_DIR + '/temp/**'], cb);
});

gulp.task('package', function(cb) {
	var opts = {
		dir: BUILD_DIR,
		name: 'Tc',
		platform: 'all',
		arch: 'ia32',
		version: '0.34.2',
		'app-version': VERSION,
		'build-version': VERSION,
    'app-copyright': 'Copyright 2015 Andrea Stella. All rights reserved',
		icon: 'src/assets-embed/icon',
		'version-string': {
			CompanyName: 'Mccxiv Software',
			FileDescription: 'Tc, the chat client for Twitch',
			ProductName: 'Tc'
		},
		out: PACKAGED_DIR
	};
	packager(opts, cb);
});

gulp.task('remove-unnecessary-package-files', function(cb) {
	var dir = PACKAGED_DIR + '/Tc-win32-ia32/';
	del([
		dir + 'd3dcompiler_47.dll',
		dir + 'pdf.dll',
		dir + 'xinput1_3.dll'
	], cb);
});

gulp.task('make-windows-installer', function() {
	return winInstaller({
		appDirectory: PACKAGED_DIR + '/Tc-win32-ia32',
		outputDirectory: DIST_DIR,
		iconUrl: path.resolve('src/assets-embed/icon.ico'),
		loadingGif: path.resolve('src/assets-embed/install.gif'),
		exe: 'Tc.exe',
		version: VERSION,
		setupExe: 'tc-setup-'+VERSION+'.exe',
		authors: 'Mccxiv Software',
		description: 'Tc, the chat client for Twitch',
		title: 'Tc, the chat client for Twitch',
		setupIcon: path.resolve('src/assets-embed/icon.ico')
	});
});

gulp.task('clean-after', function(cb) {
	del([BUILD_DIR, PACKAGED_DIR], cb);
});