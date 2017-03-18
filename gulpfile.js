var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

// set variable via $ gulp --type prod
var environment = $.util.env.type || 'staging';
var isProduction = environment === 'prod';
var webpackConfig = require('./webpack.config.js').getConfig(environment);

var app = 'static-assets/';
var dist = 'public/';

var autoprefixerBrowsers = [
	'ie >= 9',
	'ie_mob >= 10',
	'ff >= 30',
	'chrome >= 34',
	'safari >= 6',
	'opera >= 23',
	'ios >= 6',
	'android >= 4.4',
	'bb >= 10'
];

gulp.task('scripts', function () {
	return gulp.src(webpackConfig.entry)
		.pipe($.webpack(webpackConfig))
		.pipe(isProduction ? $.uglifyjs() : $.util.noop())
		.pipe(gulp.dest(dist + 'js/'))
});

gulp.task('lint', function () {
	return gulp.src([app + '/scripts/**/*.{js, jsx}'])
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.eslint.failOnError());
});

// fonts
gulp.task('fonts', function () {
	return gulp.src([app + '/fonts/**/*.*'])
		.pipe(gulp.dest(dist + '/fonts/'));
});

gulp.task('styles', function () {
	return gulp.src(app + 'sass/main.scss')
		.pipe($.sourcemaps.init())
		.pipe($.sass({
			outputStyle: isProduction ? 'compact' : 'compressed'
		}).on('error', $.notify.onError(function (error) {
			return 'Error: ' + error.message;
		})))
		.pipe($.autoprefixer({browsers: autoprefixerBrowsers}))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(dist + '/css'))
});

// copy images
gulp.task('images', function (cb) {
	return gulp.src(app + 'images/**/*.{png,jpg,jpeg,gif,svg}')
		.pipe(isProduction ? $.image({}) : $.util.noop()).on('error', $.notify.onError(function (error) {
			return 'Error: ' + error.message;
		}))
		.pipe(gulp.dest(dist + 'images/'));
});

// watch scss, html and js file changes
gulp.task('watch', function () {
	gulp.watch(app + 'images/**/*.{png,jpg,jpeg,gif,svg}', ['images']);
	gulp.watch(app + 'sass/**/*.scss', ['styles']);
	gulp.watch(app + 'scripts/**/*.jsx', ['scripts', 'lint']);
	gulp.watch(app + 'scripts/**/*.js', ['scripts', 'lint']);
});

// remove bundles
gulp.task('clean', function () {
	return del([dist]);
});

// by default build project and then watch files in order to trigger livereload
gulp.task('default', ['build', 'watch']);

// waits until clean is finished then builds the project
gulp.task('build', ['clean'], function () {
	console.log('hi!');
	gulp.start(['images', 'fonts', 'scripts', 'styles']);
});
