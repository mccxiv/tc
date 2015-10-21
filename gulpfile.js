var fs =              require('fs');
var del =             require('del');
var zip =             require('gulp-zip');
var exec =            require('child_process').exec;
var gulp =            require('gulp');
var path =            require('path');
var inno =            require("innosetup-compiler");
var shell =           require('gulp-shell');
var rimraf =          require('rimraf');
var useref =          require('gulp-useref');
var uglify =          require('gulp-uglify');
var gulpif =          require('gulp-if');
var concat =          require('gulp-concat');
var addsrc =          require('gulp-add-src');
var rename =          require('gulp-rename');
var base64 =          require('gulp-css-base64');
var jeditor =         require("gulp-json-editor");
var minifyCss =       require('gulp-minify-css');
var NwBuilder =       require('node-webkit-builder');
var stripDebug =      require('gulp-strip-debug');
var ngAnnotate =      require('gulp-ng-annotate');
var runSequence =     require('run-sequence');
var templateCache =   require('gulp-angular-templatecache');

var version = require('root-require')('src/package.json').version;

if (typeof version !== 'string' || version.length < 6) {
	throw new Error('Invalid version from package.json');
}

gulp.task('default', ['make-dist']);

gulp.task('run-production-win32', function(cb) {
	exec('"build/tc/win32/tc.exe"', cb);
});

gulp.task('run-development', function(cb) {
	//exec('node_modules\\.bin\\nw .\\src', cb);
	exec(path.normalize('node_modules/.bin/nw ./src'), cb);
});

gulp.task('make-dist', function(cb) {
	runSequence(
		'clean-before',
		[
			'copy-assets',
			'copy-package-json',
			'copy-node-modules'
		],
		'cache-templates',
		'concat-minify-replace',
		'clean-cached-templates',
		'build',
		[
			'make-windows-installer',
			'windows-zip',
			'mac-zip',
			'linux-tarball'
		],
		'rename-windows-installer',
		'clean-after',
		cb);
});

gulp.task('clean-before', function(cb) {
	del(['build-temp/', 'build/', 'dist/'], cb);
});

gulp.task('copy-assets', function() {
	return gulp.src('src/assets/**/*')
		.pipe(gulp.dest('build-temp/assets/'));
});

gulp.task('copy-package-json', function() {
	return gulp.src('src/package.json')
		.pipe(jeditor(function(json) {
			delete json.dependencies;
			json.window.toolbar = false;
			return json;
		}))
		.pipe(gulp.dest('build-temp/'));
});

gulp.task('copy-node-modules', function () {
	return gulp.src(['src/node_modules/**/*', '!src/node_modules/.bin'], {base: 'src/node_modules'})
		.pipe(gulp.dest('build-temp/node_modules/'));
});

gulp.task('cache-templates', function() {
	return gulp.src('src/ng/**/*.html')
		.pipe(templateCache({module: 'tc', root: 'ng'}))
		.pipe(gulp.dest('build-temp/temp/'));
});

gulp.task('concat-minify-replace', function() {
	var assets = useref.assets({noconcat: true});
	return gulp.src('src/app.html')
		.pipe(assets)
		.pipe(addsrc.append('build-temp/temp/templates.js'))
		.pipe(gulpif('*.js', concat('app.js')))
		.pipe(gulpif('*.js', ngAnnotate()))
		.pipe(gulpif('*.js', stripDebug()))
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', base64({maxWeightResource: Infinity})))
		.pipe(gulpif('*.css', concat('style.css')))
		.pipe(gulpif('*.css', minifyCss()))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('build-temp/'));
});

gulp.task('clean-cached-templates', function(cb) {
	del(['build-temp/temp/**'], cb);
});

gulp.task('build', function() {
	var nw = new NwBuilder({
		files: 'build-temp/**/**',
		platforms: ['osx32', 'win32', 'linux32'],
		version: '0.12.1',
		winIco: 'src/assets-embed/win.ico',
		macIcns: 'src/assets-embed/osx.icns'
	});
	return nw.build();
});

gulp.task('make-windows-installer', function(cb) {
	inno('tc-inno-setup.iss', {gui: false, verbose: false}, cb);
});

gulp.task('windows-zip', function() {
	return gulp.src('build/tc/win32/**/*')
		.pipe(rename(function(path) {
			path.dirname = path.dirname === '.'? 'tc' : 'tc/'+path.dirname;
		}))
		.pipe(zip('tc-windows-'+version+'.zip'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('mac-zip', function() {
	return gulp.src('build/tc/osx32/**/*')
		.pipe(zip('tc-osx-'+version+'.zip'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('linux-tarball', function() {
	return gulp.src('build/tc/linux32/**/*')
		.pipe(zip('tc-linux-'+version+'.zip'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('rename-windows-installer', function(cb) {
	fs.rename('dist/tc-setup.exe', 'dist/tc-setup-'+version+'.exe', cb);
});

gulp.task('clean-after', function(cb) {
	del(['build-temp/'], cb);
});