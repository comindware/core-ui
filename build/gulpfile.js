/**
 * Developer: Stepan Burguchev
 * Date: 2/2/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

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

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');
const webpack = require('webpack');
const karma = require('karma');

const pathResolver = require('./pathResolver');

// ###
// Worker tasks
// ###

gulp.task('clean', require('./tasks/cleanTask'));

gulp.task('localization', require('./tasks/localizationTask'));
gulp.task('watch:localization', () => {
    gulp.watch(pathResolver.localizationSource('*'), [ 'localization' ]);
});

gulp.task('generateSprites', require('./tasks/generateSpritesTask'));
gulp.task('watch:generateSprites', () => {
    gulp.watch(pathResolver.resources('sprites/*'), [ 'generateSprites' ]);
});

gulp.task('jsdoc', require('./tasks/jsdocTask'));

gulp.task('prepareToPublish', require('./tasks/prepareToPublishTask'));

gulp.task('build:core:dev', require('./tasks/buildDevTask'));
gulp.task('watch:build:core:dev', () => {
    gulp.watch([ pathResolver.source('**/*'), pathResolver.resources('**/*') ], [ 'build:core:dev' ]);
});

gulp.task('build:core:prod', require('./tasks/buildProdTask')(false));
gulp.task('build:core:prod:min', require('./tasks/buildProdTask')(true));

// ###
// Public tasks
// ###

gulp.task('deploy:pages', require('./tasks/deployPagesTask'));

gulp.task('test', function (done) {
    new karma.Server({
        configFile: pathResolver.root('karma.conf.js'),
        singleRun: true
    }, done).start();
});

gulp.task('test:coverage', function (done) {
    new karma.Server({
        configFile: pathResolver.root('karma.conf.js'),
        singleRun: true,
        coverage: true
    }, done).start();
});

gulp.task('test:watch', function (done) {
    new karma.Server({
        configFile: pathResolver.root('karma.conf.js')
    }, done).start();
});

gulp.task('start', callback =>
    runSequence('localization', 'generateSprites', 'build:core:dev', ['watch:localization', 'watch:build:core:dev', 'watch:generateSprites'], callback));

gulp.task('build', callback => runSequence('clean', 'localization', 'generateSprites', ['build:core:prod', 'build:core:prod:min', 'jsdoc'], callback));

gulp.task('deploy', callback => runSequence('build', 'test:coverage', 'prepareToPublish', callback));

gulp.task('default', ['start']);
