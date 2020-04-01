const gulp = require('gulp'),
    browserSync = require('browser-sync'),
    del = require('gulp-clean'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    scss = require('gulp-sass'),
    uglify = require('gulp-uglify-es').default,
    tinyPNG = require('gulp-tinypng-compress'),
    sourcemaps = require('gulp-sourcemaps'),
    watch = require('gulp-watch');

scss.compiler = require('node-sass');

/* Start DEV version */

const browser = () => {
    browserSync.init({
		server: {
			baseDir: `./build`,
		},
		notify: false
    });
};

const cacheClear = () => {
    cache.clearAll();
};

const libsJs = (cb) => {
    return gulp.src('app/libs/*.js')
        .pipe(plumber())
        .pipe(uglify())
		.pipe(gulp.dest('build/js/'))
		.pipe(browserSync.reload({
			stream: true
        }));
    cb();
};

const libsCss = (cb) => {
    return gulp.src('app/libs/*.scss')
        .pipe(plumber())
        .pipe(scss().on('error', scss.logError))
        .pipe(gulp.dest('build/css/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const mainCssDev = (cb) => {
    return gulp.src('app/scss/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(scss().on('error', scss.logError))
    .pipe(autoprefixer('last 5 versions'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/css/'))
    .pipe(browserSync.reload({
        stream: true
    }));
    cb();
};

const htmlDev = (cb) => {
    return gulp.src('app/*.html')
        .pipe(plumber())
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const copyImg = (cb) => {
    return gulp.src('app/img/*.*', {nodir: false})
        .pipe(gulp.dest('build/img/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const watcher = () => {
    watch('app/img/**/*.*', gulp.series(copyImg, cacheClear));
    watch('app/libs/**/*.*', gulp.series(libsCss, libsJs, cacheClear));
    watch('app/scss/**/*.*', gulp.series(mainCssDev, cacheClear));
    watch('app/*.html', gulp.series(htmlDev, cacheClear));
};

exports.default =  gulp.series(gulp.parallel(copyImg, libsCss, libsJs, mainCssDev, htmlDev), gulp.parallel(browser, watcher));

/* End DEV version */

/* Start Production */

const compressImg = (cb) => {
    return gulp.src('build/img/*.{png,jpg,jpeg}')
        .pipe(tinyPNG({
            key: 'mJlv0hcHVqlj6z0xKdcQXd9Z0PXS6Qm5',
            summarize: true,
            parallel: true,
            parallelMax: 20,
            log: true
        }))
        .pipe(gulp.dest('build/'));
    cb();
};

const removeModules = (cb) => {
    return gulp.src('node_modules', {read: false})
        .pipe(del());
    cb();
};

exports.production = gulp.series(compressImg, removeModules);
/* End Production */