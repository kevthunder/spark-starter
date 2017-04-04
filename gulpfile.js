var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');

gulp.task('coffee', function() {
  gulp.src('./src/*.coffee')
    .pipe(coffee({bare: true}))
    .pipe(rename('spark-starter.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', function () {
  gulp.src('./dist/spark-starter.js')
    .pipe(uglify())
    .pipe(rename('spark-starter.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['coffee', 'compress'], function () {
    console.log('Build Complete');
});

gulp.task('default', ['build']);