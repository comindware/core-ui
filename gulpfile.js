/**
 * Developer: Stepan Burguchev
 * Date: 2/2/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/*
* Usage
*
* gulp start - builds a development version of the library, then starts watchers.
* gulp deploy - updates dist and doc directories with the latest artifacts. Builds both development & production versions of the library.
* gulp test - performs single run of tests using Karma.
* gulp test:watch - starts Karma in watcher mode, debug through http://localhost:9876.
*
* default task: gulp start
*
* */

"use strict";

const gulp = require('gulp');
const gutil = require("gulp-util");
const webpack = require("webpack");
const webpackConfigFactory = require("./webpack.config.js");
const babel = require('gulp-babel');
const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs');
const del = require('del');
const mkdirp = require('mkdirp');
const karma = require('karma');

const config = {
    assetsDir: path.resolve(`${__dirname}/public/assets`)
};

gulp.task('clear', function () {
    del.sync([`${config.assetsDir}/**`]);
    mkdirp.sync(config.assetsDir);
});

gulp.task('test', function (done) {
    new karma.Server({
        configFile: `${__dirname}/karma.conf.js`,
        singleRun: true
    }, done).start();
});

gulp.task('test:coverage', function (done) {
    new karma.Server({
        configFile: `${__dirname}/karma.conf.js`,
        singleRun: true,
        coverage: true
    }, done).start();
});

gulp.task('test:watch', function (done) {
    new karma.Server({
        configFile: `${__dirname}/karma.conf.js`
    }, done).start();
});

gulp.task('jsdoc', function() {
    const jsdoc = require('gulp-jsdoc');
    return gulp.src('./src/**/*.js')
        .pipe(babel({
            presets: ["es2015"],
            plugins: ["transform-es2015-modules-commonjs"]
        }))
        .pipe(jsdoc.parser({}))
        .pipe(jsdoc.generator('./doc', {
            "path": `${__dirname}/node_modules/ink-docstrap/template`,
            "includeDate": false,
            "systemName": "Comindware UI-Core API",
            "footer": "",
            "copyright": "Comindware Copyright © 2016",
            "navType": "vertical",
            "theme": "cerulean",
            "linenums": true,
            "collapseSymbols": false,
            "inverseNav": true,
            "highlightTutorialCode": true,
            "plugins": ["plugins/markdown"],
            "markdown": {
                "parser": "gfm",
                "hardwrap": true
            }
        }, {
            "outputSourceFiles": true,
            "outputSourcePath": true,
            "cleverLinks": false,
            "monospaceLinks": false
        }));
});

gulp.task('localization', function (cb) {
    // ###
    // This task requires Comindware Localization Tool installed in PATH.
    // ###
    let localizerBin = 'Localization.Export.exe';
    let localizationResources = 'http://comindware.com/text#core';
    let localizationSource = 'localization/localization.n3';
    let localizationDestination = 'dist/localization/temp/localization.js';

    let localizationCommand = localizerBin +
        ' --export js --source "' + localizationSource +
        '" --destination "' + localizationDestination +
        '" -r ' + localizationResources +
        ' --languages en ru de';

    mkdirp.sync('dist/localization/temp');

    exec(localizationCommand, function (err, stdout, stderr) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
        console.log(stderr);

        fs.readdirSync('dist/localization/temp').forEach(fileName => {
            let langCode = fileName.substr(16, 2);
            let fileContent = fs.readFileSync(`dist/localization/temp/${fileName}`, 'utf8');
            // We call Function because the fileContent still isn't a valid JSON.
            fileContent = 'return ' + fileContent.substring(fileContent.indexOf('var LANGMAP') + 16);
            let data = (new Function(fileContent))(); // jshint ignore:line
            fs.writeFileSync(`dist/localization/localization.${langCode}.json`, JSON.stringify(data), 'utf8');
        });
        del.sync(['dist/localization/temp/**']);

        cb(err);
    });
});

gulp.task("webpack:build:release", function(callback) {
    // modify some webpack config options
    var myConfig = webpackConfigFactory.build({
        env: 'production',
        uglify: false
    });

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
    env: 'production',
    uglify: false
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
    gulp.watch([ 'src/**/*', 'resources/**/*' ], [ 'webpack:build:debug' ]);
    gulp.watch('localization/*', [ 'localization' ]);
});

// The production task builds optimized and regular bundles and generates jsdoc documentation
gulp.task('deploy', [ 'clear', 'jsdoc', 'localization', 'webpack:build:debug', 'webpack:build:release' ]);

gulp.task('default', ['start']);
