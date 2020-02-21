/* global require */

const gulp = require('gulp');
const karma = require('karma');

const pathResolver = require('./pathResolver');

gulp.task('localization', require('./tasks/localizationTask'));
gulp.task('watch:localization', () => {
    gulp.watch('../localization/*', gulp.series('localization'));
});

gulp.task('generateSprites', require('./tasks/generateSpritesTask'));
gulp.task('watch:generateSprites', () => {
    gulp.watch('../resources/sprites/*', gulp.series('generateSprites'));
});

gulp.task('generateThemes', require('./tasks/generateThemesTask'));
gulp.task('watch:generateThemes', () => {
    gulp.watch('../resources/styles/themes/**/*', gulp.series('generateThemes'));
});

gulp.task('prepareToPublish', require('./tasks/prepareToPublishTask'));

gulp.task('build:core:dev', require('./tasks/buildDevTask'));
gulp.task('watch:build:core:dev', () => {
    gulp.watch(['../src/**/*', '../resources/**/*'], gulp.parallel('build:core:dev', 'generateSprites'));
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

gulp.task(
    'start',
    gulp.series(
        'localization',
        'build:core:dev',
        'generateSprites',
        'generateThemes',
        gulp.parallel('watch:localization', 'watch:build:core:dev', 'watch:generateSprites', 'watch:generateThemes', 'test:watch')
    )
);

gulp.task(
    'develop',
    gulp.series(
        'localization',
        'build:core:dev',
        'generateSprites',
        'generateThemes',
        gulp.parallel('watch:localization', 'watch:build:core:dev', 'watch:generateSprites', 'watch:generateThemes')
    )
);

gulp.task('build', gulp.series('build:core:prod', 'localization', 'generateSprites', 'generateThemes'));

gulp.task('build:min', gulp.series('build:core:prod', 'build:core:deploy', 'localization', 'generateSprites', 'generateThemes'));

gulp.task('deploy', gulp.series('build:core:prod', 'build:core:deploy', 'localization', 'generateSprites', 'generateThemes', 'test:coverage', 'prepareToPublish'));

gulp.task('default', gulp.series('start'));
