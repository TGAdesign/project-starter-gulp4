var gulp = require('gulp');
var using = require('gulp-using');
var grep = require('gulp-grep');
var changed = require('gulp-changed');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var replaceHtml = require('gulp-html-replace');
var ngAnnotate = require('gulp-ng-annotate');
var minifyJson = require('gulp-jsonminify');
var minifyImg = require('gulp-imagemin');
var uglifyJs = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var exit = require('gulp-exit');
var merge = require('merge-stream');
var order = require('gulp-order');
var rename = require('gulp-rename');

var paths = {
    dirs: {
        build: 'dist'
    },
    html: {
        src: 'src/**/*.html',
        dest: 'dist/'
    },
    js: {
        src: 'src/assets/**/*.js', 
        dest: 'dist/assets/js'
    },
    images: {
        src: 'src/**/*.{JPG,jpg,png,gif}',
        dest: 'dist/'
    }, 
    json: {
        src: 'src/**/*.json', 
        dest: 'dist/'
    }, 
    sass: {
        src: 'src/assets/**/*.scss', 
        dest: 'dist/assets/css'
    },
    elementstyle: {
        src: 'src/assets/**/target-menu.scss', 
        dest: 'dist/assets/css'
    },
//  vendor: {
//    components: {
//      all: 'src/**/vendor/**/*.*',
//      js: 'src/**/vendor/**/*.js',
//      flash: 'src/components/angularjs-jwplayer/vendor/jwplayer/*.swf',
//      xml: 'src/**/vendor/**/*.xml',
//      nonJs: [
//        'src/**/vendor/**/*',
//        '!src/**/vendor/**/*.js'
//      ]
//    },
//    bower: {
//      js: [
//        'bower_components/*/*.js',
//        'bower_components/*/dist/**/*.js',
//        'bower_components/*/release/**/*.js',
//        '!bower_components/angular-bootstrap/ui-bootstrap.js',
//        '!bower_components/**/*/*min.*',
//        '!bower_components/*/Gruntfile.js'
//      ],
//      css: [
//        'bower_components/**/font-awesome/css/font-awesome.css',
//        '!bower_components/**/src/**/*'
//      ],
//      fonts: [
//        'bower_components/bootstrap/dist/fonts/*',
//        'bower_components/font-awesome/fonts/*'
//      ]
//    }
//  }
};

// Shared tasks
//gulp.task('glob', function () {
//  var pattern = '.build/**/*.css';
//
//  gulp.src(pattern, { read:false })
//    .pipe(using());
//});
//
//gulp.task('clean', function (cb) {
//  return del(paths.dirs.build, cb);
//});




// Development build specific tasks
gulp.task('html', function () {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest));
});

gulp.task('images', function () {
  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('js', function() {
  return gulp.src(paths.js.src)
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglifyJs())
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('json', function () {
  return gulp.src(paths.json.src)
    .pipe(gulp.dest(paths.json.dest));
});

gulp.task('elementstyle', function () {
  return gulp.src(paths.elementstyle.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('target-menu.css'))
    .pipe(gulp.dest(paths.elementstyle.dest));
});

gulp.task('sass', function(){    
    return gulp.src(paths.sass.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(concat('style.css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(gulp.dest(paths.sass.dest))
});

gulp.task('build', gulp.parallel('html', 'js', 'json', 'images', 'elementstyle', 'sass'));

//gulp.task('vendor:components:js', function () {
//  return gulp.src(paths.vendor.components.js)
//    .pipe(gulp.dest(paths.dirs.build));
//});
//
//gulp.task('vendor:components:other', function () {
//  return gulp.src(paths.vendor.components.nonJs)
//    .pipe(gulp.dest(paths.dirs.build));
//});
//
//gulp.task('vendor:components', gulp.parallel(
//  'vendor:components:js', 'vendor:components:other'
//));
//
//gulp.task('vendor:js', function () {
//  return gulp.src(paths.vendor.bower.js)
//    .pipe(gulp.dest(paths.dirs.build + '/vendor'));
//});
//
//gulp.task('vendor:css', function () {
//  return gulp.src(paths.vendor.bower.css)
//    .pipe(gulp.dest(paths.dirs.build + '/vendor'));
//});
//
//gulp.task('vendor:fonts', function () {
//  return gulp.src(paths.vendor.bower.fonts, { base: 'bower_components' })
//    .pipe(gulp.dest(paths.dirs.build + '/vendor'));
//});
//
//gulp.task('vendor', gulp.parallel(
//  'vendor:components', 'vendor:js', 'vendor:css'
//));


////gulp.task('all', gulp.parallel('app', 'vendor'));
//gulp.task('build', gulp.series('clean', 'all'));
//

gulp.task('browsersync', function(cb) {
  browserSync({
    server: {
      baseDir: paths.dirs.build
    },
    port: 8000,
    notify: false,
    open: false
  }, cb);
});

//
//gulp.task('watch', function() {
//  gulp.watch(paths.sass, gulp.series('sass'));
//
//});
//
//gulp.task('watch:code', function () {
//    gulp.watch([
//    paths.html,
//    paths.images,
//    paths.json,
//    paths.vendor.components.all,
//    paths.vendor.bower.js
//  ], gulp.series('build', browserSync.reload));
//});

gulp.task('watch:styles', function () {
  gulp.watch(paths.sass.src, gulp.series('sass','elementstyle'));
});

gulp.task('watch:scripts', function () {
  gulp.watch(paths.js.src, gulp.series('js'));
});

gulp.task('watch:images', function () {
  gulp.watch(paths.images.src, gulp.series('images'));
});

gulp.task('watch', gulp.series('build',
  gulp.parallel('watch:styles', 'watch:scripts','watch:images')
));

// Default task
gulp.task('default', gulp.series(
  gulp.parallel('watch','browsersync')
  
));

// gulp.task('watch', gulp.parallel('watch:styles'));

// gulp.task('default', gulp.series('build', 'ws', 'watch'));