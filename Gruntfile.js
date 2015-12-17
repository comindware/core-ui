/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global require, define, module, __dirname */

(function ()
{
    'use strict';

    module.exports = function (grunt) {
        grunt.log.subhead('Loading configuration...');

        var _ = require('underscore');
        var fs = require('fs');
        var fse = require('fs-extra');
        var config = require('./js/core/Config.js');

        grunt.initConfig({
            requirejs: {
                core: {
                    options: {
                        baseUrl: "js/",
                        exclude: [],
                        findNestedDependencies: false,
                        name: "comindware/core",
                        out: "./comindware/core.js",
                        waitSeconds: 60,
                        wrapShim: true,
                        optimize: "none", // uglify2 or none
                        generateSourceMaps: true,
                        preserveLicenseComments: false,
                        paths: config.paths,
                        shim: config.shim
                    }
                }
            },
            bower: {
                install: {
                    options: {
                        targetDir: 'js/lib',
                        layout: 'byComponent',
                        verbose: true
                    }
                }
            }
        });

        grunt.loadNpmTasks('grunt-contrib-requirejs');
        grunt.loadNpmTasks('grunt-bower-task');

        grunt.registerTask('build:bundle', [ 'bower', 'requirejs' ]);
        grunt.registerTask('default', [ 'build:bundle' ]);
    };
}());
