/**
 * Developer: Stepan Burguchev
 * Date: 6/8/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

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

gulp.task('clear', function () {
    del.sync([`${config.assetsDir}/**`]);
    mkdirp.sync(config.assetsDir);
});

gulp.task('start', function () {
    let webpackConfig = webpackConfigFactory.build({
        env: 'development'
    });
    let compiler = webpack(webpackConfig);

    startServer('node', [config.serverPath], function () {
        browserSync.init({
            proxy: {
                target: config.server,
                middleware: [
                    webpackDevMiddleware(compiler, {
                        noInfo: true,
                        publicPath: webpackConfig.output.publicPath,
                        stats: {
                            colors: true
                        }
                    })
                ]
            },
            port: config.proxyPort,
            open: false
        });
    });
});

gulp.task('deploy', ['clear'], function (callback) {
    const webpackConfig = webpackConfigFactory.build({
        env: 'production'
    });
    webpack(webpackConfig, function (err, stats) {
        if (err) {
            throw new gutil.PluginError('deploy', err);
        }
        gutil.log('[deploy]', stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('default', ['start']);
