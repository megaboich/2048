var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var jasmine = require('gulp-jasmine');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('deploy_libs_js_debug', function () {
    var taskResult = gulp
        .src([
            'lib/*.js'
        ])
        .pipe(gulp.dest('build/lib'));

    return taskResult;
});

gulp.task('deploy_html_debug', function () {
    var taskResult = gulp
        .src([
            'src/**/*.html'
        ])
        .pipe(gulp.dest('build'));

    return taskResult;
});

gulp.task('build_typescript_debug', function () {
    var taskResult = gulp
        .src([
            'src/**/*.ts',
            'lib/typings/**/*.ts',
            '!src/**/*.spec.ts'
        ], { base: 'src/app' })
        .pipe(sourcemaps.init())
        .pipe(ts({
            sortOutput: true,
            declarationFiles: true,
            noExternalResolve: true,
            out: 'app.js'
        }));

    return taskResult.js
        .pipe(sourcemaps.write({ debug: true, includeContent: true})) // Now the sourcemaps are added to the .js file 
        .pipe(gulp.dest('build'));
});

gulp.task('build_typescript_with_tests', function () {
    var taskResult = gulp
        .src([
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


gulp.task('debug', ['build_typescript_debug', 'deploy_html_debug', 'deploy_libs_js_debug'], function () {
});

gulp.task('run_tests', ['build_typescript_with_tests'], function () {
    return gulp
        .src('build_tests/app_test.js')
        // gulp-jasmine works on filepaths so you can't have any plugins before it 
        .pipe(jasmine());
});
