'use strict';

const $           = require('gulp-load-plugins')();
const gulp        = require('gulp');
const browserSync = require('browser-sync').create();

const site_name = 'base';
const src_path  = 'src';
const dist_path = 'dist';

let debug = true;
let proxy = 'base.dev';
let staticSrc = src_path+'/**/*.{webm,svg,eot,ttf,woff,woff2,otf,mp4,json,pdf,ico}';


/*  
 * Clean
 */
gulp.task('clean', () => {
	
	return gulp.src(dist_path, {read: false})
		.pipe($.clean());
});

/*  
 * Copy static files
 */
gulp.task('copy', () => {
	
	return gulp.src(staticSrc)
	.pipe(gulp.dest(dist_path+'/'))
})

/*  
 * SASS
 */
gulp.task("sass", () => {

	let out = gulp.src(src_path+'/scss/'+site_name+'.scss')
		.pipe( $.cssGlobbing({
			extensions: ['.scss']
		})); 

	// Create Sourmaps for develop
	if (debug) {

		return out.pipe($.sourcemaps.init())
			.pipe($.sass({ style: 'compressed', sourcemap: true}))
			.on('error', $.sass.logError)
			.on('error', (err) => {
				$.notify().write(err);
			})
			.pipe( $.autoprefixer({
				browsers: ['last 2 versions','ie >= 9'],
				cascade: false
			}))
			.pipe($.rename(site_name+'.min.css'))
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest('./'+dist_path+'/css'))
			.pipe(browserSync.stream({match: '**/*.css'}));

		}

	// Remove sourcemaps and minify for production
	else {
		return out.pipe($.sass({ style: 'compressed'}))
			.on('error', $.sass.logError)
			.on('error', (err) => {
				$.notify().write(err);
			})
			.pipe( $.autoprefixer({
				browsers: ['last 2 versions','ie >= 9'],
				cascade: false
			}))
			.pipe($.rename(site_name+'.min.css'))
			.pipe(gulp.dest('./'+dist_path+'/css'));
	}

});

/*  
 * Javascript
 */
gulp.task('js', () => {
	
	// Development 
	if (debug) {
		return gulp.src(src_path+'/js/'+site_name+'.js')
			.pipe($.sourcemaps.init())
			.pipe($.browserify({
				insertGlobals : true,
				debug : debug
			}))
			.on('error', (err) => {
				$.notify().write(err);
			})
			.pipe($.babel({
				presets: ['es2015']
			}))
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(dist_path+'/js'))
	}
	// Production 
	else {
		return gulp.src(src_path+'/js/'+site_name+'.js')
			.pipe($.browserify({
				insertGlobals : true,
				debug : debug
			}))
			.on('error', (err) => {
				$.notify().write(err);
			})
			.pipe($.babel({
				presets: ['es2015']
			}))
			.pipe(gulp.dest(dist_path+'/js'))
	}

});


/*  
 * Javascript watch
 */
gulp.task('js-watch', ['js'], (done) => {
	
	browserSync.reload();
	done();
});

/*  
 * Image optimisation
 */
gulp.task('images', () => {
  
	return gulp.src(['./'+src_path+'/img/**/*.jpg', './'+src_path+'/img/**/*.png', './'+src_path+'/img/**/*.jpeg'])
		.pipe($.image())
		.pipe(gulp.dest('./'+dist_path+'/img/'));
});

/*  
 * Serve and watch for changes
 */
gulp.task( "dev", ['copy', 'sass', 'js'], () => {

	// Serve
	browserSync.init({
		proxy: proxy,
		ghostMode: false
	});

	// Watch
	gulp.watch(src_path+'/img/**/*', ['images']);
	gulp.watch(src_path+'/scss/**/*.scss', ['sass']);
	gulp.watch(src_path+'/js/**/*.js', ['js-watch']);
	gulp.watch(['./**/*.html']).on('change', browserSync.reload);
	gulp.watch(staticSrc, ['copy']);

	gulp.watch([
		dist_path+'/**/*.js',
		dist_path+'/**/*.css'
	]);
});

/*  
 * Set debug mode to false
 */
gulp.task('production', () => {

	debug = false;
	console.log(`Set debug to: ${debug}`);
})

gulp.task('build', ['production', 'images', 'copy', 'sass', 'js']);