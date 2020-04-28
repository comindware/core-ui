/* eslint-disable global-require */
/* global require, module */
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const cssnano = require('cssnano');
const pathResolver = require('./pathResolver');
const jsFileName = 'core.js';
const jsFileNameMin = 'core.min.js';
const cssFileName = 'core.css';
const cssFileNameMin = 'core.min.css';
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const babelConfig = require('../babel.config.json');

module.exports = options => {
    const PRODUCTION = options.uglify;
    const TEST_COVERAGE = options.env === 'test-coverage';
    const TEST = options.env === 'test' || TEST_COVERAGE;
    const UGLIFY = options.uglify || false;

    const FONT_LIMIT = PRODUCTION ? 10000 : 1000000;
    const GRAPHICS_LIMIT = PRODUCTION ? 10000 : 1000000;
    const webpackConfig = {
        mode: PRODUCTION ? 'production' : 'development',
        devtool: TEST ? 'inline-source-map' : 'source-map',
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'eslint-loader',
                    exclude: [
                        pathResolver.compiled(),
                        pathResolver.node_modules(),
                        pathResolver.source('external'),
                        pathResolver.source('collections'),
                        pathResolver.source('services/AjaxService.js'),
                        pathResolver.source('Meta.js'),
                        pathResolver.source('form/editors/impl/dateTime/views/initializeDatePicker.js'),
                        pathResolver.tests(),
                        pathResolver.demo()
                    ],
                    include: [pathResolver.source()],
                    options: {
                        quiet: true,
                        //fix: true,
                        cache: true
                    }
                },
                {
                    test: /\.(ts)|(js)$/,
                    loader: 'babel-loader',
                    exclude: [pathResolver.node_modules()],
                    options: babelConfig
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                plugins: () => {
                                    const plugins = [require('postcss-preset-env')()];
                                    if (UGLIFY) {
                                        plugins.push(
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
                                        );
                                    }
                                    return plugins;
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.hbs$/,
                    loader: 'html-loader'
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader'
                },
                {
                    test: /\.woff(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        prefix: 'fonts/',
                        name: '[path][name].[ext]',
                        limit: FONT_LIMIT,
                        mimetype: 'application/font-woff'
                    }
                },
                {
                    test: /\.woff2(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        prefix: 'fonts/',
                        name: '[path][name].[ext]',
                        limit: FONT_LIMIT,
                        mimetype: 'application/font-woff2'
                    }
                },
                {
                    test: /\.svg(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        prefix: 'fonts/',
                        name: '[path][name].[ext]',
                        limit: GRAPHICS_LIMIT,
                        mimetype: 'image/svg+xml'
                    }
                },
                {
                    test: /\.(png|jpg)$/,
                    loader: 'url-loader',
                    options: {
                        limit: GRAPHICS_LIMIT
                    }
                },
                {
                    test: /bootstrap-datetime-picker/,
                    use: [
                        {
                            loader: 'imports-loader',
                            options: 'jquery'
                        }
                    ]
                },
                {
                    test: /backbone\.marionette\.js/,
                    use: [
                        {
                            loader: 'expose-loader',
                            options: 'Marionette'
                        }
                    ]
                },
                {
                    test: /backbone\.js/,
                    use: [
                        {
                            loader: 'expose-loader',
                            options: 'Backbone'
                        }
                    ]
                },
                {
                    test: /moment\.js/,
                    use: [
                        {
                            loader: 'expose-loader',
                            options: 'moment'
                        }
                    ]
                },
                {
                    test: /handlebars\.js/,
                    use: [
                        {
                            loader: 'expose-loader',
                            options: 'Handlebars'
                        }
                    ]
                },
                {
                    test: /jquery\.js/,
                    use: [
                        {
                            loader: 'expose-loader',
                            options: '$'
                        },
                        {
                            loader: 'expose-loader',
                            options: 'jQuery'
                        }
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: UGLIFY ? cssFileNameMin : cssFileName
            }),
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|ru|en/),
            new TypedocWebpackPlugin(
                {
                    out: './docs',
                    module: 'commonjs',
                    target: 'es6',
                    exclude: '**/node_modules/**/*.*',
                    tsconfig: '../tsconfig.json',
                    experimentalDecorators: true,
                    ignoreCompilerErrors: true
                },
                // '../src'
            ),
            new StylelintPlugin({
                files: ['../resources/styles/*.css', '../resources/styles/**/*.css', '../resources/styles/**/**/*.css']
            })
        ],
        resolve: {
            modules: [pathResolver.source(), pathResolver.node_modules()],
            alias: {
                'backbone.trackit': pathResolver.source('external/backbone.trackit.js'),
                'jquery-ui': pathResolver.source('external/jquery-ui.js'),
                handlebars: 'handlebars/dist/handlebars',
                localizationMap: pathResolver.compiled('localization/localization.en.json')
            },
            extensions: ['.ts', '.js', '.json']
        },
        devServer: {
            noInfo: true,
            stats: 'minimal'
        }
    };

    if (!TEST) {
        webpackConfig.entry = [pathResolver.source('coreApi.ts')];
        webpackConfig.output = {
            path: pathResolver.compiled(),
            filename: jsFileName,
            library: 'core',
            libraryTarget: 'umd'
        };
    }
    if (TEST_COVERAGE) {
        webpackConfig.module.rules.push({
            test: /\.(j|t)sx?$/,
            enforce: 'post',
            exclude: [pathResolver.tests(), pathResolver.node_modules(), pathResolver.source('external')],
            use: {
                loader: 'istanbul-instrumenter-loader',
                options: { esModules: true }
            }
        });
    }

    if (PRODUCTION) {
        webpackConfig.output.filename = UGLIFY ? jsFileNameMin : jsFileName;
        webpackConfig.devtool = 'source-map';

        webpackConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    }

    return webpackConfig;
};
