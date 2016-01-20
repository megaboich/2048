var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var jasmine = require('gulp-jasmine');

gulp.task('release', function () {
	var tsResult = gulp.src([
            'src/**/*.ts', 
            'lib/**/*.ts', 
            '!src/**/*.spec.ts'
            ])
		.pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
			noImplicitAny: true,
			out: 'app.js'
		}))
		.pipe(gulp.dest('build'));
    
    return tsResult;
});

 
gulp.task('build_tests', function () {
	var tsResult = gulp.src([
            'src/**/*.ts', 
            'lib/**/*.ts'
            ])
		.pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
			noImplicitAny: true,
			out: 'app_test.js'
		}))
		.pipe(gulp.dest('build'));
    
    return tsResult;
});


gulp.task('run_tests', ['build_tests'], function () {
    return gulp.src('build/app_test.js')
		// gulp-jasmine works on filepaths so you can't have any plugins before it 
		.pipe(jasmine());
});
