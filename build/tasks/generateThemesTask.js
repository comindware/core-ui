/*eslint-env node*/
const gulp = require('gulp');
const concat = require('gulp-concat');
const merge = require('merge-stream');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postCSSCustomProperties = require('postcss-custom-properties');
const apply = require('postcss-apply');
const pathResolver = require('../pathResolver');

const themes = ['main', 'new'];

const themeTask = name => {
    const themePath = `styles/themes/${name}`;
    const theme = require(pathResolver.resources(themePath));
    const sources = [pathResolver.resources('styles/themes/theme.css'), pathResolver.resources(`${themePath}/styles.css`)];

    return gulp
        .src(sources)
        .pipe(
            postcss([
                postCSSCustomProperties({
                    preserve: false,
                    warnings: true,
                    variables: theme.variables
                }),
                apply({
                    sets: theme.apply
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
        .pipe(concat('theme.css'))
        .pipe(gulp.dest(pathResolver.compiled(`themes/${name}`)));
};

module.exports = () => {
    const tasks = themes.map(name => themeTask(name));
    return merge(tasks);
};
