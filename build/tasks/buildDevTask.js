const fs = require('fs');
const gulpUtil = require('gulp-util');
const webpack = require('webpack');
const webpackConfigFactory = require('../webpack.config.js');

module.exports = callback => {
    const compiler = webpack(
        webpackConfigFactory({
            env: 'development',
            uglify: false,
            clean: false
        })
    );
    compiler.run((err, stats) => {
        if (err) {
            throw new gulpUtil.PluginError('webpack:build:core', err);
        }
        gulpUtil.log(
            'webpack:build:core:dev',
            stats.toString({
                colors: true,
                chunks: false,
                source: false,
                hash: false,
                modules: false,
                errorDetails: true,
                version: false,
                assets: false,
                chunkModules: false,
                children: false
            })
        );
        callback();
    });
};
