'use strict'

module.exports = function() {
	$.gulp.task('js-libs', function(){
		return $.gulp.src($.path.app)
		.pipe($.gp.concat('common.min.js'))
		.pipe($.gp.uglify())
		.pipe($.gp.sourcemaps.write())
		.pipe($.gulp.dest($.config.root + '/js'))
	})
};