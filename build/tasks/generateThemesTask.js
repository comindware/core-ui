/*eslint-env node*/
const gulp = require('gulp');
const concat = require('gulp-concat');
const merge = require('merge-stream');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postCSSCustomProperties = require('postcss-custom-properties');
const pathResolver = require('../pathResolver');

const themes = ['main_compact', 'main'];

const themeTask = name => {
    const themePath = 'styles';
    const sources = [pathResolver.resources('styles/theme.css'), pathResolver.resources(`${themePath}/baseStyles.css`)];

    return gulp
        .src(sources)
        .pipe(
            postcss([
                postCSSCustomProperties({
                    preserve: false,
                    warnings: true
                }),
                autoprefixer(),
                cssnano({
                    preset: [
                        'default',
                        {
                            discardComments: {
                                removeAll: true
                            }
                        }
                    ]
                })
            ])
        )
        .pipe(concat('theme.css'))
        .pipe(gulp.dest(pathResolver.compiled(`themes/${name}`)));
};

module.exports = () => {
    const tasks = themes.map(name => themeTask(name));
    return merge(tasks);
};
