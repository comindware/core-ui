/**
 * Developer: Stepan Burguchev
 * Date: 11/30/2016
 * Copyright: 2009-2016 ApprovalMax
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF ApprovalMax
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');

const pathResolver = require('../pathResolver');

module.exports = () => {
    const jsdoc = require('gulp-jsdoc');
    return gulp.src('./src/**/*.js')
        .pipe(babel({
            presets: ['es2015'],
            plugins: ['transform-es2015-modules-commonjs']
        }))
        .pipe(jsdoc.parser({}))
        .pipe(jsdoc.generator('./doc', {
            'path': `${__dirname}/node_modules/ink-docstrap/template`,
            'includeDate': false,
            'systemName': 'Comindware UI-Core API',
            'footer': '',
            'copyright': 'Comindware Copyright © 2016',
            'navType': 'vertical',
            'theme': 'cerulean',
            'linenums': true,
            'collapseSymbols': false,
            'inverseNav': true,
            'highlightTutorialCode': true,
            'plugins': ['plugins/markdown'],
            'markdown': {
                'parser': 'gfm',
                'hardwrap': true
            }
        }, {
            'outputSourceFiles': true,
            'outputSourcePath': true,
            'cleverLinks': false,
            'monospaceLinks': false
        }));
};
