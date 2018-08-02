const fs = require('fs');
const gulpUtil = require('gulp-util');
const webpack = require('webpack');
const webpackConfigFactory = require('../webpack.config.js');
const pathResolver = require('../pathResolver');

module.exports = callback => {
    const config = {
        writePerformanceLog: false
    };

    const compiler = webpack(webpackConfigFactory({
        env: 'development',
        uglify: false,
        clean: false
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

    compiler.run((err, stats) => {
        if (err) {
            throw new gulpUtil.PluginError('webpack:build:core', err);
        }
        gulpUtil.log('webpack:build:core:dev', stats.toString({
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
