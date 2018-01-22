'use strict';

const gulp         = require('gulp'),
      sass         = require('gulp-sass'),
      browserSync  = require('browser-sync'),
      concat       = require('gulp-concat'),
      minify       = require('gulp-minify'),
      // cssnano      = require('gulp-cssnano'),
      cssnano      = require('gulp-clean-css'),
      rename       = require('gulp-rename'),
      del          = require('del'),
      imagemin     = require('gulp-imagemin'),
      pngquant     = require('imagemin-pngquant'),
      cache        = require('gulp-cache'),
      autoprefixer = require('gulp-autoprefixer'),
      gulpIf       = require('gulp-if'),
      sourcemaps   = require('gulp-sourcemaps'),
			babel 			 = require('gulp-babel');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('sass', () => {
  return gulp.src('app/sass/{main,media}.sass')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
		.pipe(gulpIf(!isDevelopment, cssnano({compatibility: 'ie8'})))
		.pipe(gulpIf('**/*.css', rename({suffix: '.min'})))
    .pipe(gulp.dest('app/css'))
});
gulp.task('lib', () => {
  return gulp.src('node_modules/jquery/dist/jquery.min.js')
	.pipe(gulpIf('**/jquery.min.js', rename({basename: 'jquery-3.2.1.min'})))
	.pipe(gulp.dest('app/js/libs'))
});
gulp.task('libs', () => {
  return gulp.src([
	'node_modules/jquery-ui/external/jquery-1.12.4/jquery.js',
	'node_modules/reconnecting-websocket/dist/index.js',
	'node_modules/vis/dist/vis.min.js',
	'node_modules/pouchdb/dist/pouchdb.min.js',
	'app/libs/tether/js/tether.js',
	'app/libs/jquery_simple_websocket/jquery.simple.websocket.min.js',
	'app/libs/jquery_simple_websocket/jquery.simple.websocket.js',
	'app/libs/jq_ui/jquery-ui.min.js',
	'app/libs/bootstrap/js/bootstrap.js',
	'node_modules/leaflet/dist/leaflet.js',
	'app/libs/leaflet.fullscreen/Control.FullScreen.js',
	'app/libs/leaflet.locatecontrol/L.Control.Locate.min.js',
	'app/libs/Leaflet.MovingMarker/MovingMarker.js',
	'app/libs/asidebar/js/jquery/asidebar.jquery.js',
	'app/libs/Semantic-UI/semantic.min.js',
	'app/libs/FeedEk/FeedEk.js'])
	.pipe(gulp.dest('app/js/libs'));
});
gulp.task('babeljs', () => {
	return gulp.src(['app/js/common.js'], { since: gulp.lastRun('babeljs') })
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(minify({
			ext: {
				min: '.min.js'
			},
		}))
		.pipe(gulp.dest('dist/js'))
});
gulp.task('minjs', () => {
  return gulp.src(['app/js/libs/**/*.js'], { since: gulp.lastRun('minjs') })
	.pipe(minify({
	  ext:{
		min: '.min.js'
	  },
	  ignoreFiles: ['*.min.js']
	}))
	.pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
	// .pipe(gulpIf('**/*.min.js', gulp.dest('dist/js')))
	.pipe(gulpIf(['**/*.min.js'], gulp.dest('dist/js/libs')))
});
gulp.task('cssnano', () => {
  return gulp.src([
	'app/libs/tether/css/tether.css',
	'node_modules/vis/dist/vis.min.css',
	'app/libs/tether/css/tether-theme-arrows.css',
	'app/libs/tether/css/tether-theme-arrows-dark.css',
	'app/libs/tether/css/tether-theme-basic.css',
	'app/libs/bootstrap/css/bootstrap.css',
	'node_modules/leaflet/dist/leaflet.css',
	'app/libs/jq_ui/jquery-ui.min.css',
	'app/libs/leaflet.fullscreen/Control.FullScreen.css',
	'app/sass/leaflet.ie.css',
	'app/libs/leaflet.locatecontrol/L.Control.Locate.min.css',
	'app/libs/asidebar/dist.css',
	'app/libs/Semantic-UI/semantic.min.css',
	'app/libs/font-awesome/css/font-awesome.css',
	'app/libs/FeedEk/FeedEk.css'
  ], { since: gulp.lastRun('cssnano') })
	.pipe(cssnano({compatibility: 'ie8'}))
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
  return gulp.src(['app/css/**/*.*', 'app/*.html', 'app/libs/font-awesome/fonts/*.*', 'app/js/*.json'], { since: gulp.lastRun('copy') })
    .pipe(gulpIf('**/*.{css,map}', gulp.dest('dist/css')))
	.pipe(gulpIf('**/*.html', gulp.dest('dist')))
	.pipe(gulpIf('**/*.{svg,otf,eot,ttf,woff,woff2}', gulp.dest('dist/fonts')))
});
gulp.task('json', () => {
	return gulp.src('app/js/info.json')
		.pipe(gulp.dest('dist/js'))
});
gulp.task('watch', () => {
  gulp.watch('app/sass/**/*.*', gulp.series('sass'));
  gulp.watch('app/css/**/*.*', gulp.series('copy'));
  gulp.watch('app/js/**/*.*', gulp.series('babeljs'));
  gulp.watch('app/images/**/*.*', gulp.series('images'));
  gulp.watch('app/*.html', gulp.series('copy'));
});
gulp.task('build', gulp.series(
  'clean',
  'sass',
  gulp.parallel('libs', 'lib', 'cssnano', 'images'),
	'babeljs',
	'minjs',
	gulp.parallel('copy', 'json'),
  gulp.parallel('watch', 'browser-sync')
  )
);




