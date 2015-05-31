var fs =              require('fs');
var del =             require('del');
var rimraf =          require('rimraf');
var zip =             require('gulp-zip');
var exec =            require('child_process').exec;
var gulp =            require('gulp');
var inno =            require("innosetup-compiler");
var shell =           require('gulp-shell');
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

gulp.task('clean-before', function(cb) {
	del(['build-temp/**/**', 'build/**/**', 'dist/'], function() {
		setTimeout(cb, 500); // Fix Windows issues
	});
});

gulp.task('clean-after', function(cb) {
	// TODO doesn't clean up properly, why?
	setTimeout(function() {
		del(['build-temp/'], function() {
			setTimeout(cb, 1000); // Fix Windows issues
		});
	}, 1000);
});

gulp.task('cache-templates', function() {
	return gulp.src('src/ng/**/*.html')
		.pipe(templateCache({module: 'tc', root: 'ng'}))
		.pipe(gulp.dest('build-temp/temp/'));
});

gulp.task('clean-cached-templates', function(cb) {
	del(['build-temp/temp/**'], cb);
});

gulp.task('concat-minify-replace', function() {
	var assets = useref.assets({noconcat: true});
	return gulp.src('src/app.html')
		.pipe(assets)
		.pipe(addsrc.append('build-temp/temp/templates.js'))
		.pipe(gulpif('*.js', concat('app.js')))
		.pipe(gulpif('*.js', ngAnnotate()))
		.pipe(gulpif('*.js', stripDebug()))
		//.pipe(gulpif('*.js', uglify())) // TODO re-enable but it breaks things!
		.pipe(gulpif('*.css', base64({maxWeightResource: Infinity})))
		.pipe(gulpif('*.css', concat('style.css')))
		.pipe(gulpif('*.css', minifyCss()))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('build-temp/'));
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

gulp.task('build', function() {
	var nw = new NwBuilder({
		files: 'build-temp/**/**',
		platforms: ['osx32', 'win32', 'linux32'],
		version: '0.12.1',
		winIco: 'src/assets-embed/win.ico'
	});
	nw.on('log',  console.log);
	return nw.build();
});

gulp.task('make-build', function(cb) {
	runSequence(
		'clean-before',
		['copy-assets',
		'copy-package-json',
		'copy-node-modules'],
		'cache-templates',
		'concat-minify-replace',
		'clean-cached-templates',
		'build',
		['make-windows-installer',
		'windows-zip',
		'mac-zip',
		'linux-tarball'],
		'rename-windows-installer',
		cb);
});

gulp.task('make-windows-installer', function(cb) {
	inno('tc-inno-setup.iss', {gui: false, verbose: false}, cb);
});

gulp.task('rename-windows-installer', function(cb) {
	fs.rename('dist/tc-setup.exe', 'dist/tc-setup-'+version+'.exe', cb);
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

gulp.task('run-production-win32', function(cb) {
	exec('"build/tc/win32/tc.exe"', cb);
});

gulp.task('run-development', function(cb) {
	exec('nw src/.', cb);
});

gulp.task('default', ['make-build']);