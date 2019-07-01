'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var uncss = require('gulp-uncss');
var minifyjs  = require('gulp-js-minify');
var rigger = require('gulp-rigger');

var browserSync = require('browser-sync');
var reload      = browserSync.reload;
// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        port: 8080,
        open: true,
        notify: false
    });
});


gulp.task('sass', function () {
    gulp.src(['sass/stack.scss'])
    //.pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        //.pipe(sourcemaps.write())
        .pipe(concat('styles.min.css'))
        .pipe(minifyCSS({
            keepBreaks: false
        }))
        .pipe(gulp.dest('production'))
        .pipe(reload({stream:true}));
});
gulp.task('sass:watch', function () {
    gulp.watch(['sass/*.scss', 'sass/modules/*.scss'], ['sass']);
});


gulp.task('html', function () {
        gulp.src(['pages/*.html', 'pages/modal/*.html'])
            .pipe(rigger())
            .pipe(gulp.dest(''))
            .pipe(reload({stream:true}));
});
gulp.task('html:watch', function () {
    gulp.watch(['pages/*.html','pages/modules/*.html', 'pages/modal/*.html'], ['html']);
});


gulp.task('js', function () {
    gulp.src(['js/libs/*.js', 'js/*.js', 'js/directives/*.js'])
        //.pipe(uglify().on('error', function(e){
         //   console.log(e);
        //}))
        .pipe(concat('scripts.min.js'))
        .pipe(gulp.dest('production'))
        .pipe(reload({stream:true}));
});

gulp.task('js:watch', function () {
    gulp.watch('js/*.js', ['js']);
});


gulp.task('clean', function() {
    return gulp.src(['production'], {read: false})
        .pipe(clean());
});

gulp.task('default', ['clean', 'browser-sync'], function() {
    gulp.start('sass:watch', 'js:watch', 'html:watch',  'sass', 'js');
});