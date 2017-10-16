'use strict';

const gulp         = require('gulp'),
      sass         = require('gulp-sass'),
      browserSync  = require('browser-sync'),
      concat       = require('gulp-concat'),
      minify       = require('gulp-minify'),
      cssnano      = require('gulp-cssnano'),
      rename       = require('gulp-rename'),
      del          = require('del'),
      imagemin     = require('gulp-imagemin'),
      pngquant     = require('imagemin-pngquant'),
      cache        = require('gulp-cache'),
      autoprefixer = require('gulp-autoprefixer'),
      gulpIf       = require('gulp-if'),
      sourcemaps   = require('gulp-sourcemaps');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('sass', () => {
  return gulp.src('app/sass/main.sass')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
	.pipe(gulpIf(!isDevelopment, cssnano()))
	.pipe(gulpIf('**/*.css', rename({suffix: '.min'})))
    .pipe(gulp.dest('app/css'))
});

gulp.task('lib', () => {
  return gulp.src('app/libs/jquery-3.2.1/dist/jquery.min.js')
	.pipe(gulpIf('**/jquery.min.js', rename({basename: 'jquery-3.2.1.min'})))
	.pipe(gulp.dest('app/js/libs'))
});

gulp.task('libs', () => {
  return gulp.src([
	'app/libs/jquery/jquery.min.js',
	'app/libs/tether/dist/js/tether.js',
	'app/libs/bootstrap/dist/js/bootstrap.js',
	'app/libs/leaflet/dist/leaflet-src.js',
	'app/libs/leaflet.locatecontrol/dist/L.Control.Locate.min.js',
	'app/libs/Leaflet.MovingMarker/MovingMarker.js',
	'app/libs/asidebar/js/jquery/asidebar.jquery.js'
  ],)
	.pipe(gulp.dest('app/js/libs'));
});

// gulp.task('js', () => {
//   return gulp.src('app/js/common.js')
// 	.pipe(concat())
// });

gulp.task('minjs', () => {
  return gulp.src('app/js/**/*.js', { since: gulp.lastRun('minjs') })
	.pipe(minify({
	  ext:{
		min: '.min.js'
	  },
	  ignoreFiles: ['*.min.js']
	}))
	.pipe(gulpIf('**/*.min.js', gulp.dest('dist/js')));
});

gulp.task('cssnano', () => {
  return gulp.src([
	'app/libs/tether/dist/css/tether.css',
	'app/libs/tether/dist/css/tether-theme-arrows.css',
	'app/libs/tether/dist/css/tether-theme-arrows-dark.css',
	'app/libs/tether/dist/css/tether-theme-basic.css',
	'app/libs/bootstrap/dist/css/bootstrap.css',
	'app/libs/bootstrap/dist/css/bootstrap-grid.css',
	'app/libs/bootstrap/dist/css/bootstrap-reboot.css',
	'app/libs/leaflet/dist/leaflet.css',
	'app/libs/leaflet.locatecontrol/dist/L.Control.Locate.min.css',
	'app/libs/asidebar/dist.css'
  ], { since: gulp.lastRun('cssnano') })
	.pipe(cssnano())
	.pipe(gulp.dest('app/css/libs'));
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
  return del('dist');
});

gulp.task('copy', () => {
  return gulp.src(['app/css/**/*.*', 'app/*.html', 'app/libs/bootstrap/fonts/*.*'], { since: gulp.lastRun('copy') })
    .pipe(gulpIf('**/*.{css,map}', gulp.dest('dist/css')))
	.pipe(gulpIf('**/*.html', gulp.dest('dist')))
	.pipe(gulpIf('**/*.{eot,svg,ttf,woff,woff2}', gulp.dest('dist/fonts')))
});

gulp.task('watch', () => {
  gulp.watch('app/sass/**/*.*', gulp.series('sass'));
  gulp.watch('app/css/**/*.*', gulp.series('copy'));
  gulp.watch('app/js/**/*.*', gulp.series('minjs'));
  gulp.watch('app/images/**/*.*', gulp.series('images'));
  gulp.watch('app/*.html', gulp.series('copy'));
});

gulp.task('build', gulp.series(
  'clean',
  'sass',
  gulp.parallel('libs', 'lib', 'cssnano', 'images'),
  'minjs',
  'copy',
  gulp.parallel('watch', 'browser-sync')
  )
);




