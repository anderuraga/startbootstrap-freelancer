"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const concat = require('gulp-concat');
const responsive = require('gulp-responsive');
 
function images(){
  return gulp.src('src/img/portfolio/*.{png,jpg}')
    .pipe(responsive({
      // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
      '*.jpg': [{
        width: 320,
        rename: { suffix: '-320w' },
      }, {
        width: 480,
        rename: { suffix: '-480w' },
      }, {
        width: 800,
        rename: { suffix: '-800w' },
      }, {
        // Compress, strip metadata, and rename original image
        rename: { suffix: '-original' },
      }],
      // Resize all PNG images to be retina ready
      '*.png': [{
        width: 320,
        rename: { suffix: '-320w' },
      }, {
        width: 480,
        rename: { suffix: '-480w' },
      }, {
        width: 800,
        rename: { suffix: '-800w' },
      }, {
        // Compress, strip metadata, and rename original image
        rename: { suffix: '-original' },
      }],
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 70,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
    }))
    .pipe(gulp.dest('img/portfolio'));
}

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}


// Clean vendor
function clean() {
  return del(["./vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap JS
  var bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/*')
    .pipe(gulp.dest('./vendor/bootstrap/js'));
  // Font Awesome CSS
  var fontAwesomeCSS = gulp.src('./node_modules/@fortawesome/fontawesome-free/css/**/*')
    .pipe(gulp.dest('./vendor/fontawesome-free/css'));
  // Font Awesome Webfonts
  var fontAwesomeWebfonts = gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
    .pipe(gulp.dest('./vendor/fontawesome-free/webfonts'));
  // jQuery Easing
  var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
    .pipe(gulp.dest('./vendor/jquery-easing'));
  // jQuery
  var jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));
  return merge(bootstrapJS, fontAwesomeCSS, fontAwesomeWebfonts, jquery, jqueryEasing);
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(browsersync.stream());
}




// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browsersync.stream());
}

// concat html
 function html() {
   return gulp.src([
                  'htmls/head.html',    
                  'htmls/navigation.html',
                  'htmls/masterhead.html',
                  'htmls/about.html',
                  'htmls/about2.html',
                  'htmls/servicios.html',
                  'htmls/contacto.html',
                  'htmls/footer.html',
                  'htmls/modales.html',
                  'htmls/foot.html'               
                ])
  .pipe(concat('index.html'))
  .pipe(gulp.dest('./'));
}




// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch(["./js/**/*", "!./js/**/*.min.js"], js);
  gulp.watch("./htmls/**/*", html);
  gulp.watch("./htmls/**/*", browserSyncReload);
  
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js, html));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.html = html;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
exports.images = images;

