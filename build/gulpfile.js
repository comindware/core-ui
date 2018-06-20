/*
* Usage
*
* gulp start - builds a development version of the library, then starts watchers.
* gulp deploy - updates dist and doc directories with the latest artifacts. Builds both development & production versions of the library.
* gulp test - performs single run of tests using Karma.
* gulp test:watch - starts Karma in watcher mode, debug through http://localhost:9876.
*
* default task: gulp start
*
* */

const gulp = require('gulp');
const runSequence = require('run-sequence');
const karma = require('karma');

const pathResolver = require('./pathResolver');

// ###
// Worker tasks
// ###

gulp.task('localization', require('./tasks/localizationTask'));
gulp.task('watch:localization', () => {
    gulp.watch(pathResolver.localizationSource('*'), ['localization']);
});

gulp.task('generateSprites', require('./tasks/generateSpritesTask'));
gulp.task('watch:generateSprites', () => {
    gulp.watch(pathResolver.resources('sprites/*'), ['generateSprites']);
});

gulp.task('generateThemes', require('./tasks/generateThemesTask'));
gulp.task('watch:generateThemes', () => {
    gulp.watch(pathResolver.resources('styles/themes/**/*'), ['generateThemes']);
});

gulp.task('jsdoc', require('./tasks/jsdocTask'));

gulp.task('prepareToPublish', require('./tasks/prepareToPublishTask'));

gulp.task('build:core:dev', require('./tasks/buildDevTask'));
gulp.task('watch:build:core:dev', () => {
    gulp.watch([pathResolver.source('**/*'), pathResolver.resources('**/*')], ['build:core:dev', 'generateSprites']);
});

gulp.task('build:core:prod', require('./tasks/buildProdTask')(false));
gulp.task('build:core:deploy', require('./tasks/buildProdTask')(true));
// ###
// Public tasks
// ###

gulp.task('deploy:pages', require('./tasks/deployPagesTask'));

gulp.task('test', done => {
    new karma.Server(
        {
            configFile: pathResolver.root('karma.conf.js'),
            singleRun: true
        },
        done
    ).start();
});

gulp.task('test:watch', done => {
    new karma.Server(
        {
            configFile: pathResolver.root('karma.conf.js'),
            singleRun: false,
            coverage: false
        },
        done
    ).start();
});

gulp.task('test:coverage', done => {
    new karma.Server(
        {
            configFile: pathResolver.root('karma.conf.js'),
            singleRun: true,
            coverage: true
        },
        done
    ).start();
});

gulp.task('test:watch', done => {
    new karma.Server(
        {
            configFile: pathResolver.root('karma.conf.js')
        },
        done
    ).start();
});

gulp.task('start', callback =>
    runSequence(
        'localization',
        'build:core:dev',
        'generateSprites',
        'generateThemes',
        ['watch:localization', 'watch:build:core:dev', 'watch:generateSprites', 'watch:generateThemes', 'test:watch'],
        callback
    )
);

gulp.task('build', callback => runSequence(['build:core:prod', 'jsdoc'], 'localization', 'generateSprites', 'generateThemes', callback));

gulp.task('build:min', callback => runSequence(['build:core:prod', 'build:core:deploy', 'jsdoc'], 'localization', 'generateSprites', 'generateThemes', callback));

gulp.task('deploy', callback =>
    runSequence(['build:core:prod', 'build:core:deploy', 'jsdoc'], 'localization', 'generateSprites', 'generateThemes', 'test:coverage', 'prepareToPublish', callback)
);

gulp.task('default', ['start']);
