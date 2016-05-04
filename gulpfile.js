/**
 * Developer: Stepan Burguchev
 * Date: 2/2/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

var gulp = require('gulp'),
    gutil = require("gulp-util"),
    webpack = require("webpack"),
    webpackConfig = require("./webpack.config.js"),
    babel = require('gulp-babel'),
    jsdoc = require('gulp-jsdoc'),
    exec = require('child_process').exec;

gulp.task('jsdoc', function() {
    return gulp.src('./js/core/**/*.js')
        .pipe(babel({
            presets: ["es2015"],
            plugins: ["transform-es2015-modules-commonjs"]
        }))
        .pipe(jsdoc.parser({}))
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
    gulp.watch([ 'js/core/**/*', 'resources/**/*' ], [ 'webpack:build:debug' ]);
});

// The production task builds optimized and regular bundles and generates jsdoc documentation
gulp.task('production', [ 'jsdoc', 'webpack:build:debug', 'webpack:build:release' ]);

gulp.task('default', ['dev']);

gulp.task('localize:watcher', function(){
    gulp.watch('localization/*', ['localize']);
});

gulp.task('localize', function (cb) {
    var localizationDestination = 'demo/public/scripts/localization/localization.js',
        localizationSource = 'localization/localization.n3',
        localizationResources = 'http://comindware.com/text#core',
        localizerBin = 'Localization.Export.exe';

    var localizationCommand = localizerBin +
        ' --export js --source "' + localizationSource + 
        '" --destination "' + localizationDestination +
        '" -r ' + localizationResources +
        ' --languages en ru de';

        exec(localizationCommand, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
});
