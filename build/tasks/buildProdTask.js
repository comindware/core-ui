/**
 * Developer: Stepan Burguchev
 * Date: 11/30/2016
 * Copyright: 2009-2016 ApprovalMax
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF ApprovalMax
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

'use strict';

const webpackConfigFactory = require('../webpack.config.js');
const webpack = require('webpack');
const gulpUtil = require('gulp-util');

module.exports = uglify => callback => {
    const webpackConfig = webpackConfigFactory.build({
        env: 'production',
        uglify: uglify || false
    });

    // run webpack
    webpack(webpackConfig, function(err, stats) {
        if (err) {
            throw new gulpUtil.PluginError('webpack:build:core', err);
        }
        gulpUtil.log('[webpack:build:core]', stats.toString({
            colors: true,
            chunks: false
        }));
        callback();
    });
};
