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

const fs = require('fs');
const gulpUtil = require('gulp-util');
const webpack = require('webpack');

const webpackConfigFactory = require('../webpack.config.js');
const pathResolver = require('../pathResolver');

const config = {
    writePerformanceLog: false
};

const compiler = webpack(webpackConfigFactory({
    env: 'development',
    uglify: false
}));

let bundleStart = null;

compiler.plugin('compile', () => {
    gulpUtil.log('[webpack:build:core]', 'Compiling...');
    bundleStart = Date.now();
});
compiler.plugin('done', stats => {
    if (config.writePerformanceLog) {
        fs.writeFileSync(pathResolver.compiled('compile-log.json'), JSON.stringify(stats.toJson()), 'utf8');
    }
    gulpUtil.log('[webpack:build:core]', `Compiled in ${Date.now() - bundleStart}ms!`);
});

module.exports = callback => {
    compiler.run((err, stats) => {
        if (err) {
            throw new gulpUtil.PluginError('webpack:build:core', err);
        }
        gulpUtil.log('[webpack:build:core]', stats.toString({
            colors: true,
            chunks: false,
            hash: false,
            version: false,
            children: false
        }));
        callback();
    });
};
