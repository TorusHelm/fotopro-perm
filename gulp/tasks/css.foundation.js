'use strict';

module.exports = function() {
  $.gulp.task('css:foundation', function() {
    return $.gulp.src($.path.cssFoundation)

      // для либсов на scss
      .pipe($.gp.sourcemaps.init())
      .pipe($.gp.sass()).on('error', $.gp.notify.onError({ title: 'Style' }))
      .pipe($.gp.autoprefixer({ browsers: $.config.autoprefixerConfig }))
      .pipe($.gp.sourcemaps.write())

      .pipe($.gp.concatCss('libs.css'))
      .pipe($.gp.csso())
      .pipe($.gulp.dest($.config.root + '/css'))
  })
};
