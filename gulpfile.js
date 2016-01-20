var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
 
gulp.task('default', function () {
	var tsResult = gulp.src(['src/**/*.ts', 'lib/**/*.ts'])
		.pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
			noImplicitAny: true,
			out: 'app.js'
		}))
		.pipe(gulp.dest('build'));
    
    return tsResult;
});
