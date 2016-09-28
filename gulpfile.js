'use strict';

require('babel-runtime/regenerator');
require("babel-polyfill");
require('babel-core/register');

var gulp        = require('gulp')
  , babel       = require('gulp-babel')
  , concat      = require("gulp-concat")
  , sourcemaps  = require('gulp-sourcemaps')
  , mergeStream = require('merge-stream')
  , strip       = require('gulp-strip-comments')
  , del         = require('del');

gulp.task('build:js', function() {
  var polyfill = 'node_modules/regenerator-runtime/runtime.js';
  return mergeStream(
      gulp.src(polyfill),
      gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
    )
    .pipe(strip())
		.pipe(concat("sphinx-promise.js"))
    .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('clean', function (cb) {
	del(['dist'], cb);
});

gulp.task('build', ['build:js']);

gulp.task('default', ['build']);