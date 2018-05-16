/*eslint-env node*/
const gulp = require('gulp');
const merge = require('merge-stream');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postCSSCustomProperties = require('postcss-custom-properties');
const pathResolver = require('../pathResolver');

const themes = ['main', 'new'];

const themeTask = name => {
    const variables = require(pathResolver.resources(`styles/themes/${name}/variables`));
    return gulp
        .src(pathResolver.resources('styles/themes/theme.css'))
        .pipe(
            postcss([
                postCSSCustomProperties({
                    preserve: false,
                    variables
                }),
                autoprefixer({
                    browsers: ['ie 11', '> 0.25%', 'not chrome 29']
                }),
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
        .pipe(gulp.dest(pathResolver.compiled(`themes/${name}`)));
};

module.exports = () => {
    const tasks = themes.map(name => themeTask(name));
    return merge(tasks);
};
