var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var mocha = require('gulp-mocha');

gulp.task('coffee', function() {
  return gulp.src('./src/*.coffee')
    .pipe(coffee())
    .pipe(rename('spark-starter.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', ['coffee'], function () {
  return gulp.src('./dist/spark-starter.js')
    .pipe(uglify())
    .pipe(rename('spark-starter.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('coffeeTest', function() {
  return gulp.src('./test/src/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('./test/'));
});

gulp.task('build', ['coffee', 'compress'], function () {
    console.log('Build Complete');
});

gulp.task('test', ['coffee','coffeeTest'], function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha());
});

gulp.task('default', ['build']);