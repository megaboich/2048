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
            'src/**/*.html',
            'src/**/*.png',
            'src/**/*.css'
        ])
        .pipe(gulp.dest('build'));

    return taskResult;
});

function buildTypescript(sourcesArray, outDir, outFileName, isDebug, isIncludeSoourceMap) {
    
    var tsproj = ts.createProject('src/app/tsconfig.json', {
        sortOutput: true,
        declarationFiles: true,
        noExternalResolve: true,        
        out: outFileName
    });
    
    var x = gulp.src(sourcesArray, { base: 'src/app' });

    if (isIncludeSoourceMap) {
        x = x.pipe(sourcemaps.init());
    }

    x = x.pipe(ts(tsproj));

    x = x.js;

    if (isIncludeSoourceMap) {
        x = x.pipe(sourcemaps.write({ debug: true, includeContent: true })) // Now the sourcemaps are added to the .js file 
    }

    x = x.pipe(gulp.dest(outDir));

    return x;
}

gulp.task('build_typescript_debug', function () {
    return buildTypescript(
        [
            'src/**/*.ts',
            'lib/typings/**/*.ts',
            
            //exclude all tests from build
            '!src/**/*.spec.ts'
        ],
        "build",
        "app.js",
        true,
        true);
});

gulp.task('build_typescript_with_tests', function () {
     return buildTypescript(
        [
            'src/**/*.ts',
            'lib/typings/**/*.ts',
            
            //exclude app itself
            '!src/app/app.ts',
            
            //exclude PIXI-dependent render
            '!src/**/pixi-*.ts'
        ],
        "build_tests",
        "app.spec.js",
        true,
        true);
});

gulp.task('debug', ['build_typescript_debug', 'deploy_html_debug', 'deploy_libs_js_debug'], function () {
});

gulp.task('run_tests', ['build_typescript_with_tests'], function () { 
    return gulp
        .src('build_tests/app.spec.js')
        // gulp-jasmine works on filepaths so you can't have any plugins before it 
        .pipe(jasmine());
});
