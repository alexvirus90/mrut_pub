'use strict';

const gulp        = require('gulp'),
      sass        = require('gulp-sass'),
      browserSync = require('browser-sync');

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

gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: 'dist'
    },
    notify: false
  });
});

gulp.task('watch', ['browser-sync', 'sass', 'html'], function () {
  gulp.watch('app/sass/**/*.sass', ['sass']);
  gulp.watch('app/*.html', ['html'], browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});