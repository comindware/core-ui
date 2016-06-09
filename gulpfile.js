/**
 * Developer: Stepan Burguchev
 * Date: 2/2/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

const gulp = require('gulp');
const gutil = require("gulp-util");
const webpack = require("webpack");
const webpackConfigFactory = require("./webpack.config.js");
const babel = require('gulp-babel');
const jsdoc = require('gulp-jsdoc');
const exec = require('child_process').exec;

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

gulp.task('localization', function (cb) {
    let localizerBin = 'Localization.Export.exe';
    let localizationResources = 'http://comindware.com/text#core';
    let localizationSource = 'localization/localization.n3';
    let localizationDestination = 'demo/public/localization/localization.js';

    let localizationCommand = localizerBin +
        ' --export js --source "' + localizationSource +
        '" --destination "' + localizationDestination +
        '" -r ' + localizationResources +
        ' --languages en ru de';

    exec(localizationCommand, function (err, stdout, stderr) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task("webpack:build:release", function(callback) {
    // modify some webpack config options
    var myConfig = webpackConfigFactory.build({
        env: 'production'
    });
    myConfig.output = Object.create(myConfig.output);
    myConfig.output.filename = 'core.bundle.min.js';

    // run webpack
    webpack(myConfig, function(err, stats) {
        if(err) {
            throw new gutil.PluginError("webpack:build", err);
        }
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
});

var myDevConfig = webpackConfigFactory.build({
    env: 'development'
});
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
gulp.task("start", ["webpack:build:debug"], function() {
    gulp.watch([ 'js/core/**/*', 'resources/**/*' ], [ 'webpack:build:debug' ]);
    gulp.watch('localization/*', [ 'localization' ]);
});

// The production task builds optimized and regular bundles and generates jsdoc documentation
gulp.task('deploy', [ 'jsdoc', 'webpack:build:debug', 'webpack:build:release' ]);

gulp.task('default', ['start']);
