var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var concat = require('gulp-coffeescript-concat');
var stripCode = require('gulp-strip-code');
var mocha = require('gulp-mocha');

gulp.task('coffee', function() {
  return gulp.src(['./src/*.coffee', '!./src/_*.coffee'])
    .pipe(stripCode({
      pattern: /#--- Concatened ---[\s\S]*?#--- Concatened end ---/g,
    }))
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('concat', function() {
  return gulp.src([
    './src/*.coffee'
  ])
    .pipe(concat('spark-starter.coffee'))
    .pipe(stripCode({
      pattern: /#--- Standalone ---[\s\S]*?#--- Standalone end ---/g,
    }))
    .pipe(gulp.dest('./tmp/'));
});

gulp.task('concatCoffee', ['concat'], function() {
  return gulp.src(['./tmp/*.coffee'])
    .pipe(coffee())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', ['concatCoffee'], function () {
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

gulp.task('build', ['coffee', 'concatCoffee', 'compress'], function () {
    console.log('Build Complete');
});

gulp.task('test', ['coffee','coffeeTest'], function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha());
});

gulp.task('default', ['build']);