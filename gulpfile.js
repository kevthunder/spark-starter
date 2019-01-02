require('source-map-support').install();

var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');
var mocha = require('gulp-mocha');
var wrapper = require('spark-wrapper');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('coffee', function() {
  return gulp.src(['./src/**/*.coffee'])
    // .pipe(sourcemaps.init())
    .pipe(coffee({bare: true}))
    .pipe(wrapper({namespace:'Spark'}))
    .pipe(wrapper.loader({namespace:'Spark','filename':'spark-starter'}))
    // .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('concat', function() {
  return gulp.src(['./src/**/*.coffee'])
    .pipe(wrapper.compose({namespace:'Spark'}))
    .pipe(concat('spark-starter.coffee'))
    .pipe(gulp.dest('./tmp/'));
});

gulp.task('concatCoffee', gulp.series('concat', function() {
  return gulp.src(['./tmp/*.coffee'])
    .pipe(coffee())
    .pipe(gulp.dest('./dist/'));
}));

gulp.task('compress', gulp.series('concatCoffee', function () {
  return gulp.src('./dist/spark-starter.js')
    .pipe(uglify({keep_classnames:true}))
    .pipe(rename('spark-starter.min.js'))
    .pipe(gulp.dest('./dist/'));
}));

gulp.task('coffeeTest', function() {
  return gulp.src('./test/src/*.coffee')
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./test/'));
});

gulp.task('build',  gulp.series('coffee', 'concatCoffee', 'compress', function (done) {
    console.log('Build Complete');
    done();
}));

gulp.task('test', gulp.series('build','coffeeTest', function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha({require:['source-map-support/register']}));
}));

gulp.task('test-debug', gulp.series('build','coffeeTest', function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha({"inspect-brk":true, require:['source-map-support/register']}));
}));


gulp.task('default', gulp.series('build'));