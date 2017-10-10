'use strict';

const gulp         = require('gulp'),
      sass         = require('gulp-sass'),
      browserSync  = require('browser-sync'),
      concat       = require('gulp-concat'),
      uglify       = require('gulp-uglifyjs'),
      cssnano      = require('gulp-cssnano'),
      rename       = require('gulp-rename'),
      del          = require('del'),
      imagemin     = require('gulp-imagemin'),
      pngquant     = require('imagemin-pngquant'),
      cache        = require('gulp-cache'),
      autoprefixer = require('gulp-autoprefixer'),
      gulpIf       = require('gulp-if'),
      sourcemaps   = require('gulp-sourcemaps');

// const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('sass', () => {
  return gulp.src('app/sass/main.sass')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
    .pipe(gulp.dest('app/css'))
});

gulp.task('scripts', () => {
  return gulp.src([
    'app/libs/jquery/dist/jquery.min.js'
  ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});

gulp.task('css-libs', ['sass'], () =>{
  return gulp.src(['app/css/libs.css', 'app/css/main.css'])
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/css'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
	.pipe(cache(imagemin({
	  interlaced: true,
	  progressive: true,
	  svgoPlugins: [{removeViewBox: false}],
	  une: [pngquant()]
	})))
	.pipe(gulp.dest('dist/images'));
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    notify: false
  });
  browserSync.watch('dist/**/*.*').on('change', browserSync.reload);
});

gulp.task('clean', () => {
  return del.sync('dist');
});

gulp.task('clear', () => {
  return cache.clearAll();
});

gulp.task('copy', () => {
  return gulp.src(['app/css/**/*.{css,map}', 'app/js/**/*', 'app/*.html', { since: gulp.lastRun('copy') }])
    .pipe(gulp.dest('dist'))
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('css-libs', 'scripts', 'images', 'copy'),
  'browser-sync')
);

// gulp.task('watch', ['css-libs', 'scripts', 'html', 'js', 'browser-sync'], () => {
  gulp.watch('app/sass/**/*.*', gulp.series('sass'));
// });