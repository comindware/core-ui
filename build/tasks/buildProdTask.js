const webpackConfigFactory = require('../webpack.config.js');
const webpack = require('webpack');
const gulpUtil = require('gulp-util');

module.exports = uglify => callback => {
    const webpackConfig = webpackConfigFactory({
        env: 'production',
        uglify: uglify || false
    });

    // run webpack
    webpack(webpackConfig, (err, stats) => {
        if (err) {
            throw new gulpUtil.PluginError('webpack:build:core', err);
        }
        gulpUtil.log('webpack:build:core:prod', stats.toString({
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
        }));
        callback();
    });
};
