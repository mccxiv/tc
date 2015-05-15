var del =             require('del');
var zip =             require('gulp-zip');
var exec =            require('child_process').exec;
var gulp =            require('gulp');
var shell =           require('gulp-shell');
var useref =          require('gulp-useref');
var uglify =          require('gulp-uglify');
var gulpif =          require('gulp-if');
var concat =          require('gulp-concat');
var addsrc =          require('gulp-add-src');
var rename =          require('gulp-rename');
var minifyCss =       require('gulp-minify-css');
var NwBuilder =       require('node-webkit-builder');
var stripDebug =      require('gulp-strip-debug');
var ngAnnotate =      require('gulp-ng-annotate');
var runSequence =     require('run-sequence');
var templateCache =   require('gulp-angular-templatecache');

gulp.task('clean-before', function(cb) {
	del(['build-temp/**/**', 'build/**/**'], function() {
		setTimeout(cb, 500); // Fix Windows issues
	});
});

gulp.task('clean-after', function(cb) {
	del(['build-temp/**/**'], function() {
		setTimeout(cb, 500); // Fix Windows issues
	});
});

gulp.task('cache-templates', function() {
	return gulp.src('ng/**/*.html')
		.pipe(templateCache({module: 'tc', root: 'ng'}))
		.pipe(gulp.dest('build-temp/temp/'));
});

gulp.task('clean-cached-templates', function(cb) {
	del(['build-temp/temp/**'], cb);
});

gulp.task('concat-minify-replace', function() {
	var assets = useref.assets();
	return gulp.src('app.html')
		.pipe(assets)
		.pipe(addsrc.append('build-temp/temp/templates.js'))
		.pipe(gulpif('*.js', concat('app.js')))
		.pipe(gulpif('*.js', ngAnnotate()))
		.pipe(gulpif('*.js', stripDebug()))
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', minifyCss({rebase: true, relativeTo: 'build-temp/'})))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('build-temp/'));
});

gulp.task('copy-assets', function() {
	return gulp.src('assets/**/*')
		.pipe(gulp.dest('build-temp/assets/'));
});

gulp.task('copy-fonts', function() {
	return gulp.src('bower_components/material-design-iconic-font/fonts/**')
		.pipe(gulp.dest('build-temp/fonts/'));
})

gulp.task('copy-package-json', function() {
	return gulp.src('production.package.json')
		.pipe(rename('package.json'))
		.pipe(gulp.dest('build-temp/'));
});

gulp.task('copy-node-modules', function () {
	return gulp.src(['node_modules/fs-extra/**/*', 'node_modules/twitch-irc/**/*'], {base: 'node_modules'})
		.pipe(gulp.dest('build-temp/node_modules/'));
});

gulp.task('zip', function() {
	return gulp.src('build-temp/**/*')
		.pipe(zip('tc.nw', {compress: false}))
		.pipe(gulp.dest('build-temp/'));
});

gulp.task('clean-except-zip', function(cb) {
	del(['build-temp/**/*', '!build-temp/tc.nw'], function() {
		setTimeout(cb, 500); // Fix Windows issues
	});
});

gulp.task('build', function() {
	var nw = new NwBuilder({
		files: 'build-temp/**/**',
		platforms: ['osx32', 'win32'],
		version: '0.12.1'
	});
	nw.on('log',  console.log);
	return nw.build();
});

gulp.task('make-build', function(cb) {
	runSequence(
		'clean-before',
		['copy-fonts',
		'copy-assets',
		'copy-package-json',
		'copy-node-modules'],
		'cache-templates',
		'concat-minify-replace',
		'clean-cached-templates',
		'build',
		'clean-after',
		cb);
});

gulp.task('run-production-win32', function(cb) {
	exec('"build/tc/win32/tc.exe"', cb);
});

gulp.task('run-development', function(cb) {
	exec('nw .', cb);
});

gulp.task('default', ['make-build']);