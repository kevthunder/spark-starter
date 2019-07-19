require('source-map-support').install();

var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify-es').default;
var mocha = require('gulp-mocha');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var requireIndex = require('gulp-require-index');

gulp.task('coffee', function() {
  return gulp.src(['./src/**/*.coffee'])
    .pipe(sourcemaps.init())
    .pipe(coffee({bare: true}))
    .pipe(sourcemaps.write('./maps', {sourceRoot: '../src'}))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('buildIndex', function () {
  return gulp.src(['./lib/**/*.js','!./lib/spark-starter.js'])
    .pipe(requireIndex({name:'spark-starter.js'}))
    .pipe(gulp.dest('./lib'));
});

gulp.task('concat', function() {
  var b = browserify({
    entries: './lib/spark-starter.js',
    debug: true,
    standalone: 'Spark'
  })
  return b.bundle()
    .pipe(source('spark-starter.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', gulp.series('concat', function () {
  return gulp.src('./dist/spark-starter.js')
    .pipe(uglify({keep_classnames:true}))
    .pipe(rename('spark-starter.min.js'))
    .pipe(gulp.dest('./dist/'));
}));

gulp.task('coffeeTest', function() {
  return gulp.src('./test/src/*.coffee')
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write('./maps', {sourceRoot: './src'}))
    .pipe(gulp.dest('./test/'));
});

gulp.task('build',  gulp.series('coffee', 'buildIndex', 'concat', 'compress', function (done) {
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