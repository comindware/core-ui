/**
 * Developer: Stepan Burguchev
 * Date: 3/1/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

'use strict';

const gulp = require('gulp');
const path = require('path');
const svgstore = require('gulp-svgstore');
const rename = require('gulp-rename');
const svgmin = require('gulp-svgmin');

const pathResolver = require('../pathResolver');

module.exports = () => gulp
    .src(pathResolver.resources('sprites/*.svg'))
    .pipe(rename({ prefix: 'icon-' }))
    .pipe(svgmin(file => {
        const prefix = path.basename(file.relative, path.extname(file.relative));
        return {
            js2svg: {
                pretty: false
            },
            plugins: [{
                cleanupIDs: {
                    prefix: `${prefix}-`,
                    minify: true
                }
            }]
        };
    }))
    .pipe(svgstore({
        inlineSvg: true
    }))
    .pipe(gulp.dest(pathResolver.compiled()));
