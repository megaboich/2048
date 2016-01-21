var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var jasmine = require('gulp-jasmine');

gulp.task('deploy_libs_js', function () {
	var taskResult = gulp.src([
            'lib/*.js'
            ])
		.pipe(gulp.dest('build/lib'));
    
    return taskResult;
});

gulp.task('deploy_html', function () {
	var taskResult = gulp.src([
            'src/**/*.html'
            ])
		.pipe(gulp.dest('build'));
    
    return taskResult;
});

gulp.task('build_typescript_release', function () {
	var taskResult = gulp.src([
            'src/**/*.ts', 
            'lib/typings/**/*.ts', 
            '!src/**/*.spec.ts'
            ])
		.pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
			noImplicitAny: true,
			out: 'app.js'
		}))
		.pipe(gulp.dest('build'));
    
    return taskResult;
});
 
gulp.task('build_typescript_with_tests', function () {
	var taskResult = gulp.src([
            'src/**/*.ts', 
            'lib/typings/**/*.ts',
            '!src/app/app.ts'
            ])
		.pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
			noImplicitAny: true,
			out: 'app_test.js'
		}))
		.pipe(gulp.dest('build_tests'));
    
    return taskResult;
});


gulp.task('release', ['build_typescript_release', 'deploy_html', 'deploy_libs_js'], function () {
});

gulp.task('run_tests', ['build_typescript_with_tests'], function () {
    return gulp.src('build_tests/app_test.js')
		// gulp-jasmine works on filepaths so you can't have any plugins before it 
		.pipe(jasmine());
});
