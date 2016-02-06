/**
 * Developer: Stepan Burguchev
 * Date: 2/2/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

var gulp = require('gulp');
var gutil = require("gulp-util");
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");
var babel = require('gulp-babel');
var jsdoc = require('gulp-jsdoc');

gulp.task('jsdoc', function() {
    return gulp.src('./js/core/**/*.js')
        .pipe(babel({
            presets: ["es2015"],
            plugins: ["transform-es2015-modules-commonjs"]
        }))
        .pipe(jsdoc.parser({
            plugins: ["plugins/markdown"],
            "markdown": {
                "parser": "gfm",
                "hardwrap": true
            }
        }))
        .pipe(jsdoc.generator('./doc', {
            "path": "ink-docstrap",
            "dateFormat": "ddd MMM Do YYYY",
            "systemName": "Comindware UI-Core API",
            "footer": "",
            "copyright": "Comindware Copyright © 2015",
            "navType": "vertical",
            "theme": "cerulean",
            "linenums": true,
            "collapseSymbols": false,
            "inverseNav": true,
            "highlightTutorialCode": true
        }, {
            "outputSourceFiles": true,
            "outputSourcePath": true,
            "cleverLinks": false,
            "monospaceLinks": false
        }));
});

gulp.task("webpack:build:release", function(callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.output = Object.create(myConfig.output);
    myConfig.output.filename = 'core.bundle.min.js';
    myConfig.debug = false;
    //noinspection JSUnresolvedFunction
    myConfig.plugins = (myConfig.plugins || []).concat(
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );

    // run webpack
    webpack(myConfig, function(err, stats) {
        if(err) {
            //noinspection JSUnresolvedFunction
            throw new gutil.PluginError("webpack:build", err);
        }
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
});

var myDevConfig = Object.create(webpackConfig);
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build:debug", function(callback) {
    //noinspection JSUnresolvedFunction
    devCompiler.run(function(err, stats) {
        if(err) {
            throw new gutil.PluginError("webpack:build:debug", err);
        }
        gutil.log("[webpack:build:debug]", stats.toString({
            colors: true
        }));
        callback();
    });
});

// The development task builds webpack and starts watcher
gulp.task("dev", ["webpack:build:debug"], function() {
    gulp.watch([ 'js/core/**/*' ], [ 'webpack:build:debug' ]);
});

// The production task builds optimized and regular bundles and generates jsdoc documentation
gulp.task('production', [ 'jsdoc', 'webpack:build:debug', 'webpack:build:release' ]);

gulp.task('default', [ 'dev' ]);
