/**
 * Developer: Stepan Burguchev
 * Date: 6/8/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}], no-new-func: 0 */

'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const path = require('path');
const webpack = require('webpack');
const webpackConfigFactory = require('./webpack.config.js');
const browserSync = require('browser-sync').create();
const webpackDevMiddleware = require('webpack-dev-middleware');
const startServer = require('./startServer');
const del = require('del');
const mkdirp = require('mkdirp');

const config = {
    server: 'http://localhost:9999',
    serverPath: path.resolve(`${__dirname}/www`),
    proxyPort: 3000,
    assetsDir: path.resolve(`${__dirname}/public/assets`)
};

gulp.task('clear', () => {
    del.sync([`${config.assetsDir}/**`]);
    mkdirp.sync(config.assetsDir);
});

gulp.task('start', () => {
    const webpackConfig = webpackConfigFactory({
        env: 'development'
    });
    const compiler = webpack(webpackConfig);

    startServer('node', [config.serverPath], () => {
        browserSync.init({
            proxy: {
                target: config.server,
                middleware: [
                    webpackDevMiddleware(compiler, {
                        noInfo: true,
                        publicPath: webpackConfig.output.publicPath,
                        stats: {
                            colors: true,
                            chunks: false
                        }
                    })
                ]
            },
            port: config.proxyPort,
            open: false
        });
    });
});

gulp.task('build', ['clear'], callback => {
    const webpackConfig = webpackConfigFactory({
        env: 'production'
    });
    webpack(webpackConfig, (err, stats) => {
        if (err) {
            throw new gutil.PluginError('build', err);
        }
        gutil.log('[build]', stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('default', ['start']);
