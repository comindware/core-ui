/*eslint-env node*/

const gulp = require('gulp');
const path = require('path');
const merge = require('merge-stream');
const svgstore = require('gulp-svgstore');
const rename = require('gulp-rename');
const svgmin = require('gulp-svgmin');

const pathResolver = require('../pathResolver');

const iconPacks = ['main_compact', 'main'];

const spriteTask = name => {
    const iconsPath = name !== 'main_compact' ? `sprites/themes/${name}/*.svg` : 'sprites/*.svg';
    const destPath = `themes/${name}`;

    return gulp
        .src(pathResolver.resources(iconsPath))
        .pipe(rename({ prefix: 'icon-' }))
        .pipe(
            svgmin(file => {
                const prefix = path.basename(file.relative, path.extname(file.relative));
                return {
                    js2svg: {
                        pretty: false
                    },
                    plugins: [
                        {
                            cleanupIDs: {
                                prefix: `${prefix}-`,
                                minify: true
                            }
                        }
                    ]
                };
            })
        )
        .pipe(
            svgstore({
                inlineSvg: true
            })
        )
        .pipe(rename('sprites.svg'))
        .pipe(gulp.dest(pathResolver.compiled(destPath)));
};

module.exports = () => {
    const tasks = [];
    tasks.push(spriteTask());
    tasks.push(...iconPacks.map(name => spriteTask(name)));
    return merge(tasks);
};
