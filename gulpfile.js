var del =         require('del');
var gulp =        require('gulp');
var usemin =      require('gulp-usemin');
var uglify =      require('gulp-uglify');
var minifyCss =   require('gulp-minify-css');
var ngAnnotate =  require('gulp-ng-annotate');

gulp.task('clean', function(cb) {
	del(['output/**'], cb);
});

gulp.task('usemin', ['clean'], function () {
	return gulp.src('app.html')
		.pipe(usemin({
			css: [minifyCss({keepSpecialComments: 0}), 'concat'],
			js: [ngAnnotate(), uglify(), 'concat']
		}))
		.pipe(gulp.dest('output/'));
});

gulp.task('default', ['usemin']);