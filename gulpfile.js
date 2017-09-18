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
var minifyCss= require('gulp-minify-css');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var exit = require('gulp-exit');
var merge = require('merge-stream');
var order = require('gulp-order');

var paths = {
  dirs: {
    build: 'dist'
  },
  html: 'src/**/*.html',
  images: 'src/**/*.{JPG,jpg,png,gif}',
  json: 'src/**/*.json',
  sass: 'src/**/*.scss',
  vendor: {
    components: {
      all: 'src/**/vendor/**/*.*',
      js: 'src/**/vendor/**/*.js',
      flash: 'src/components/angularjs-jwplayer/vendor/jwplayer/*.swf',
      xml: 'src/**/vendor/**/*.xml',
      nonJs: [
        'src/**/vendor/**/*',
        '!src/**/vendor/**/*.js'
      ]
    },
    bower: {
      js: [
        'bower_components/*/*.js',
        'bower_components/*/dist/**/*.js',
        'bower_components/*/release/**/*.js',
        '!bower_components/angular-bootstrap/ui-bootstrap.js',
        '!bower_components/**/*/*min.*',
        '!bower_components/*/Gruntfile.js'
      ],
      css: [
        'bower_components/**/font-awesome/css/font-awesome.css',
        '!bower_components/**/src/**/*'
      ],
      fonts: [
        'bower_components/bootstrap/dist/fonts/*',
        'bower_components/font-awesome/fonts/*'
      ]
    }
  }
};

// Shared tasks
gulp.task('glob', function () {
  var pattern = '.build/**/*.css';

  gulp.src(pattern, { read:false })
    .pipe(using());
});

gulp.task('clean', function (cb) {
  return del(paths.dirs.build, cb);
});


// Development build specific tasks
gulp.task('html', function () {
  return gulp.src(paths.html)
    .pipe(gulp.dest(paths.dirs.build));
});

gulp.task('json', function () {
  return gulp.src(paths.json)
    .pipe(gulp.dest(paths.dirs.build));
});

gulp.task('images', function () {
  return gulp.src(paths.images)
    .pipe(gulp.dest(paths.dirs.build));
});

gulp.task('sass', function () {
  return gulp.src(paths.sass)
    .pipe(using({ prefix: 'After changed:' }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(changed(paths.dirs.build))
    .pipe(sourcemaps.write('.', { sourceRoot: '/' }))
    .pipe(gulp.dest(paths.dirs.build))
    .pipe(grep('**/*.css', { read: false, dot: true }))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('app', gulp.parallel('html', 'json', 'images', 'sass'));

gulp.task('vendor:components:js', function () {
  return gulp.src(paths.vendor.components.js)
    .pipe(gulp.dest(paths.dirs.build));
});

gulp.task('vendor:components:other', function () {
  return gulp.src(paths.vendor.components.nonJs)
    .pipe(gulp.dest(paths.dirs.build));
});

gulp.task('vendor:components', gulp.parallel(
  'vendor:components:js', 'vendor:components:other'
));

gulp.task('vendor:js', function () {
  return gulp.src(paths.vendor.bower.js)
    .pipe(gulp.dest(paths.dirs.build + '/vendor'));
});

gulp.task('vendor:css', function () {
  return gulp.src(paths.vendor.bower.css)
    .pipe(gulp.dest(paths.dirs.build + '/vendor'));
});

gulp.task('vendor:fonts', function () {
  return gulp.src(paths.vendor.bower.fonts, { base: 'bower_components' })
    .pipe(gulp.dest(paths.dirs.build + '/vendor'));
});

gulp.task('vendor', gulp.parallel(
  'vendor:components', 'vendor:js', 'vendor:css'
));


gulp.task('all', gulp.parallel('app', 'vendor'));
gulp.task('build', gulp.series('clean', 'all'));

gulp.task('ws', function(cb) {
  browserSync({
    server: {
      baseDir: paths.dirs.build + '/pages'
    },
    port: 8000,
    notify: false
  }, cb);
});

gulp.task('watch', function() {
    gulp.parallel('watch:styles','watch:code');
});

gulp.task('watch:styles', function () {
    gulp.watch(paths.sass, 'sass');
     
   // gulp.watch('src/**/*.scss', ['sass']);
    
});

gulp.task('watch:code', function () {
    gulp.watch([
    paths.html,
    paths.images,
    paths.json,
    paths.vendor.components.all,
    paths.vendor.bower.js
  ], gulp.series('build', browserSync.reload));
});

// gulp.task('watch', gulp.parallel('watch:styles'));

// Default task
gulp.task('default', gulp.series('build', 'ws', 'watch'));