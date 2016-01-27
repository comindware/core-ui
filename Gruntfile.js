/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global require, define, module, __dirname */

(function ()
{
    'use strict';

    module.exports = function (grunt) {
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
                        out: "./dist/core.js",
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
            },
            jsdoc : {
                dist : {
                    src: [
                        'js/core/**/*.js'
                    ],
                    options: {
                        destination: 'doc',
                        template : 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
                        configure : 'jsdoc.conf.json',
                        recurse: true,
                        verbose: true
                    }
                }
            },
            babel: {
                options: {
                    sourceMap: true
                },
                dist: {
                    files: [{
                        "expand": true,
                        "cwd": "js/core/babel/",
                        "src": ["**/*.js"],
                        "dest": "build/",
                        "ext": ".js"
                    }]
                }
            }
        });

        grunt.loadNpmTasks('grunt-babel');
        grunt.loadNpmTasks('grunt-contrib-requirejs');
        grunt.loadNpmTasks('grunt-bower-task');
        grunt.loadNpmTasks('grunt-jsdoc');

        grunt.registerTask('build:bundle', [ 'bower', 'requirejs' ]);
        grunt.registerTask('doc', [ 'jsdoc' ]);
        grunt.registerTask('default', [ 'build:bundle' ]);
    };
}());
