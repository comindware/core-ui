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
