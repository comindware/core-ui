/**
 * Developer: Stepan Burguchev
 * Date: 2/2/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

"use strict";

var gulp = require('gulp');
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

gulp.task('default', ['jsdoc'] /*function() {
    // place code for your default task here
}*/);
