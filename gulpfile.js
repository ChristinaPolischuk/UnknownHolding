const gulp = require('gulp');
const gulpPug = require('gulp-pug');
const gulpPlumber = require('gulp-plumber');
const gulpSass = require('gulp-sass');
const gulpAutoprefixer = require('gulp-autoprefixer');
const gulpCleanCss = require('gulp-clean-css');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpBabel = require('gulp-babel');
const gulpUglify = require('gulp-uglify');
const gulpImagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const spritesmith = require('gulp.spritesmith');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const gulpWebp = require('gulp-webp');
const gulpWebpHtml = require('gulp-xv-webp-html');
const gulpWebpcss = require('gulp-webpcss');
const gulpConcat = require('gulp-concat');
const gulpIf = require('gulp-if');
const gulpGroupCssMediaQueries = require('gulp-group-css-media-queries');

let isBuildFlag = false;

function clean() {
    return del('dist');
}

function fonts() {
    return gulp.src('dev/static/fonts/**/*.ttf')
        .pipe(ttf2woff({clone: true}))
        .pipe(ttf2woff2({clone: true}))
        .pipe(gulp.dest('dist/static/fonts'));
}

function pugToHtml() {
    return gulp.src('dev/pug/index.pug')
        .pipe(gulpPlumber())
        .pipe(gulpPug({
            pretty: true
        }))
        // .pipe(gulpWebpHtml(['.jpg', '.png']))
        .pipe(gulpPlumber.stop())
        .pipe(gulp.dest('dist/'));
}

function scssTocss() {
    return gulp.src('dev/static/styles/styles.scss')
        .pipe(gulpPlumber())
        .pipe(gulpSourcemaps.init())
        .pipe(gulpSass({
            includePaths: ['node_modules/bootstrap/scss']
        }))
        .pipe(gulpGroupCssMediaQueries())
        .pipe(gulpCleanCss({level: 2}))
        .pipe(gulpAutoprefixer())
        .pipe(gulpWebpcss({
            baseClass: '.webp1',
            replace_from: /\.(png|jpg|jpeg)/,
            replace_to: '.webp'
        }))
        .pipe(gulpSourcemaps.write())
        .pipe(gulpPlumber.stop())
        .pipe(browserSync.stream())
        .pipe(gulp.dest('dist/static/css'));
}

function libs() {
    return gulp.src(['node_modules/svg4everybody/dist/svg4everybody.min.js', 'dev/static/js/libs/jquery-3.6.0.min.js', 'dev/static/js/libs/slick.min.js'])
        .pipe(gulpConcat('libs.js'))
        .pipe(gulp.dest('dist/static/js/libs'));
}

function script() {
    return gulp.src('dev/static/js/main.js')
        .pipe(gulpPlumber())
        .pipe(gulpSourcemaps.init())
        .pipe(gulpBabel({
            presets: ['@babel/env']
        }))
        .pipe(gulpIf(isBuildFlag, gulpUglify()))
        .pipe(gulpSourcemaps.write())
        .pipe(gulpPlumber.stop())
        .pipe(browserSync.stream())
        .pipe(gulp.dest('dist/static/js'));
}

function images() {
    return gulp.src(['dev/static/images/**/*.{jpg,gif,png}', '!dev/static/images/svgsprite/*', '!dev/static/images/pngsprite/*'])
        .pipe(gulpImagemin([
            gulpImagemin.gifsicle({interlaced: true}),
            gulpImagemin.mozjpeg({quality: 75, progressive: true}),
            gulpImagemin.optipng({optimizationLevel: 5}),
            gulpImagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest('dist/static/images'))
        .pipe(gulpWebp({
            quality: 70
        }))
        .pipe(gulp.dest('dist/static/images'));
}

function imagesSvg() {
    return gulp.src(['dev/static/images/**/*.svg', '!dev/static/images/svgsprite/*'])
        .pipe(gulp.dest('dist/static/images'));
}

function svgSpriteBuild() {
    return gulp.src('dev/static/images/svgsprite/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('dist/static/images/sprite'));
}

function pngSpriteBuild() {
    return gulp.src('dev/static/images/pngsprite/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css'
        }))
        .pipe(gulp.dest('dist/static/images/sprite/pngsprite'));
}

function setMode(isBuild) {
    return cb => {
        isBuildFlag = isBuild;
        cb();
    }
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });

    gulp.watch("dev/pug/**/*.pug", pugToHtml);
    gulp.watch(["dev/static/images/**/*.{jpg,gif,png,svg}", "!dev/static/images/svgsprite/*"], images);
    gulp.watch(["dev/static/images/**/*.svg", "!dev/static/images/svgsprite/*"], imagesSvg);
    gulp.watch("dev/static/images/svgsprite/*.svg", svgSpriteBuild);
    gulp.watch("dev/static/images/pngsprite/*.png", pngSpriteBuild);
    gulp.watch("dev/static/js/main.js", script);
    gulp.watch("dev/static/styles/**/*.scss", scssTocss);
    gulp.watch("dist/*.html").on('change', browserSync.reload);
}

const dev = gulp.parallel(fonts, images, imagesSvg, svgSpriteBuild, pngSpriteBuild, pugToHtml, scssTocss, libs, script)

exports.default = gulp.series(clean, dev, watch);
exports.build = gulp.series(clean, setMode(true), dev);