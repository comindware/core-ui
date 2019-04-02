const webpackConfigFactory = require('./build/webpack.config.js');

module.exports = function(config) {
    const TEST_COVERAGE = config.coverage === true;

    const result = {
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        plugins: [/*'karma-safari-launcher',*/ 'karma-chrome-launcher', 'karma-firefox-launcher', 'karma-jasmine', 'karma-sourcemap-loader', 'karma-webpack', 'karma-coverage'],

        // list of files / patterns to load in the browser
        files: ['tests/tests.bundle.js', 'dist/core.css'],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'tests/tests.bundle.js': ['webpack', 'sourcemap']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9876,

        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['ChromeWithViewport', 'FirefoxHeadless' /*, 'Safari'*/],

        customLaunchers: {
            FirefoxHeadless: {
                base: 'Firefox',
                flags: ['-headless']
            },
            ChromeWithViewport: {
                base: 'ChromeHeadless',
                flags: [`--window-size=${1920},${1080}`]
            }
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        webpack: webpackConfigFactory({
            env: 'test',
            clean: false
        }),

        webpackMiddleware: {
            noInfo: true,
            stats: 'minimal'
        },

        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    };

    if (TEST_COVERAGE) {
        result.plugins.push('karma-coverage');

        result.reporters.push('coverage');

        result.coverageReporter = {
            dir: 'reports/',
            reporters: [{ type: 'html', subdir: 'report-html' }, { type: 'lcov', subdir: 'report-lcov' }, { type: 'teamcity', subdir: '.', file: 'teamcity.txt' }],
            instrumenterOptions: {
                istanbul: { noCompact: true, embedSource: true }
            }
        };

        result.webpack = webpackConfigFactory({
            env: 'test-coverage',
            clean: false
        });
    }

    config.set(result);
};
