'use strict';

const gulp        = require('gulp'),
      sass        = require('gulp-sass'),
      browserSync = require('browser-sync'),
      concat      = require('gulp-concat'),
      uglify      = require('gulp-uglifyjs'),
      cssnano     = require('gulp-cssnano'),
      rename      = require('gulp-rename');

gulp.task('sass', function () {
  return gulp.src('app/sass/**/*.sass')
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('html', function () {
  return gulp.src('app/index.html')
    .pipe(gulp.dest('dist'))
	.pipe(browserSync.reload({stream: true}))
});

gulp.task('js', function () {
  return gulp.src('app/js/**/*.js')
	.pipe(gulp.dest('dist/js'))
	.pipe(browserSync.reload({stream: true}))
});

gulp.task('scripts', function () {
  return gulp.src([
    'app/libs/jquery/dist/jquery.min.js'
  ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});

gulp.task('css-libs', ['sass'], function () {
  return gulp.src('dist/css/libs.css')
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: 'dist'
    },
    notify: false
  });
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts', 'html', 'js'], function () {
  gulp.watch('app/sass/**/*.sass', ['sass']);
  gulp.watch('app/*.html', ['html'], browserSync.reload);
  gulp.watch('app/js/**/*.js', ['js'], browserSync.reload);
});