const gulp = require('gulp');
const babel = require('gulp-babel');

module.exports = cb => {
    const jsdoc = require('gulp-jsdoc3');

    gulp.src('../src/**/*.js', { read: false })
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(jsdoc(JSON.stringify(
            {
                plugins: ['plugins/markdown'],
                recurseDepth: 10,
                source: {
                    includePattern: '.+\\.js(doc|x)?$',
                    excludePattern: '(^|\\/|\\\\)_'
                },
                templates: {
                    path: `${__dirname}/node_modules/ink-docstrap/template`,
                    includeDate: false,
                    systemName: 'Comindware UI-Core API',
                    footer: '',
                    copyright: 'Comindware Copyright © 2016',
                    navType: 'vertical',
                    theme: 'cerulean',
                    linenums: true,
                    collapseSymbols: false,
                    inverseNav: true,
                    highlightTutorialCode: true,
                    markdown: {
                        parser: 'gfm',
                        hardwrap: true
                    },
                    defaults: {
                        outputSourceFiles: true,
                        outputSourcePath: true,
                        cleverLinks: false,
                        monospaceLinks: false
                    }
                }
            }), cb)
        );
};
