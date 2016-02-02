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

        var ESDoc = require('esdoc/out/src/ESDoc.js');
        var publisher = require('esdoc/out/src/Publisher/publish.js');

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
                        //'dist/core.js'
                    ],
                    options: {
                        destination: 'doc',
                        template : 'node_modules/ink-docstrap/template',
                        configure : 'jsdoc.conf.json',
                        recurse: true,
                        verbose: true
                    }
                }
            }
        });

        grunt.loadNpmTasks('grunt-contrib-requirejs');
        grunt.loadNpmTasks('grunt-bower-task');
        grunt.loadNpmTasks('grunt-jsdoc');

        grunt.registerTask('build:bundle', [ 'bower', 'requirejs' ]);
        grunt.registerTask('doc', [ 'jsdoc' ]);
        grunt.registerTask('default', [ 'build:bundle' ]);

        grunt.registerTask('esdoc', function () {
            console.log('esdoc start...');
            var esdocConfig = {
                source: './js/core',
                destination: './esdoc'
            };
            ESDoc.generate(esdocConfig, publisher);
        });
    };
}());
