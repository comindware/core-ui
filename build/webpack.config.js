/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global module, __dirname */

'use strict';

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const _ = require('lodash');
const pathResolver = require('./pathResolver');

const jsFileName = 'core.js';
const jsFileNameMin = 'core.min.js';
const cssFileName = 'core.css';
const cssFileNameMin = 'core.min.css';

module.exports = {
    build: function (options) {
        const DEVELOPMENT = options.env === 'development';
        const PRODUCTION = options.env === 'production';
        const TEST_COVERAGE = options.env === 'test-coverage';
        const TEST = options.env === 'test' || TEST_COVERAGE;
        const UGLIFY = options.uglify || false;

        const FONT_LIMIT = PRODUCTION ? 10000 : 1000000;
        const GRAPHICS_LIMIT = PRODUCTION ? 10000 : 1000000;

        let webpackConfig = {
            cache: true,
            devtool: TEST ? 'inline-source-map' : 'source-map',
            debug: true,
            module: {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        exclude: /(node_modules|bower_components|src\/external\/)/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['es2015'],
                            cacheDirectory: true,
                            plugins: [
                                'transform-runtime'
                            ]
                        }
                    },
                    {
                        test: /\.css$/,
                        loader: ExtractTextPlugin.extract('style-loader', ['css-loader', 'postcss-loader'].join('!'))
                    },
                    {
                        test: /\.scss$/,
                        loader: ExtractTextPlugin.extract('style-loader', ['css-loader', 'postcss-loader', 'sass-loader'].join('!'))
                    },
                    {
                        test: /\.hbs$/,
                        loader: 'html'
                    },
                    {
                        test: /\.html$/,
                        loader: 'html'
                    },
                    {
                        test: /\.woff(\?.*)?$/,
                        loader: `url?prefix=fonts/&name=[path][name].[ext]&limit=${FONT_LIMIT}&mimetype=application/font-woff`
                    },
                    {
                        test: /\.woff2(\?.*)?$/,
                        loader: `url?prefix=fonts/&name=[path][name].[ext]&limit=${FONT_LIMIT}&mimetype=application/font-woff2`
                    },
                    {
                        test: /\.otf(\?.*)?$/,
                        loader: `file?prefix=fonts/&name=[path][name].[ext]&limit=${FONT_LIMIT}&mimetype=font/opentype`
                    },
                    {
                        test: /\.ttf(\?.*)?$/,
                        loader: `url?prefix=fonts/&name=[path][name].[ext]&limit=${FONT_LIMIT}&mimetype=application/octet-stream`
                    },
                    {
                        test: /\.eot(\?.*)?$/,
                        loader: 'file?prefix=fonts/&name=[path][name].[ext]'
                    },
                    {
                        test: /\.svg(\?.*)?$/,
                        loader: `url?prefix=fonts/&name=[path][name].[ext]&limit=${GRAPHICS_LIMIT}&mimetype=image/svg+xml`
                    },
                    {
                        test: /\.(png|jpg)$/,
                        loader: `url?limit=${GRAPHICS_LIMIT}`
                    },
                    {
                        test: /\.json$/,
                        loader: 'json'
                    },

                    {
                        test: /underscore\.js/,
                        loader: 'expose?_'
                    },
                    {
                        test: /jquery\.js/,
                        loader: 'expose?jQuery!expose?$'
                    },
                    {
                        test: /jquery-autosize/,
                        loader: 'imports?jquery'
                    },
                    {
                        test: /rangyinputs/,
                        loader: 'imports?jquery'
                    },
                    {
                        test: /jquery\.inputmask/,
                        loader: 'imports?jquery'
                    },
                    {
                        test: /bootstrap-datetime-picker/,
                        loader: 'imports?jquery'
                    },
                    {
                        test: /backbone\.marionette\.js/,
                        loader: 'expose?Marionette'
                    },
                    {
                        test: /backbone\.js/,
                        loader: 'expose?Backbone'
                    },
                    {
                        test: /moment\.js/,
                        loader: 'expose?moment'
                    },
                    {
                        test: /handlebars\.js/,
                        loader: 'expose?Handlebars'
                    }
                ]
            },
            sassLoader: {
                includePaths: [
                    pathResolver.resources('styles')
                ]
            },
            postcss: [
                autoprefixer({
                    browsers: ['last 2 versions']
                })
            ],
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': PRODUCTION ? '"production"' : '"development"',
                    __DEV__: !PRODUCTION
                }),
                new ExtractTextPlugin(UGLIFY ? cssFileNameMin : cssFileName)
            ],
            resolve: {
                root: [
                    pathResolver.source()
                ],
                alias: {
                    'rangyinputs': pathResolver.source('external/rangyinputs/rangyinputs-jquery-src'),
                    'keypress': pathResolver.source('external/Keypress/keypress-2.1.0.min'),
                    'handlebars': 'handlebars/dist/handlebars'
                }
            },
            devServer: {
                noInfo: true,
                stats: 'minimal'
            }
        };

        if (TEST) {
            webpackConfig.resolve.alias.localizationMap = pathResolver.compiled('localization/localization.en.json');
        }

        if (TEST_COVERAGE) {
            webpackConfig.module.postLoaders = [
                {
                    test: /\.jsx?$/,
                    exclude: [
                        pathResolver.tests(),
                        pathResolver.node_modules(),
                        pathResolver.source('external')
                    ],
                    loader: 'istanbul-instrumenter'
                }
            ];
        }

        if (!TEST) {
            webpackConfig.entry = [ 'babel-polyfill', pathResolver.source('coreApi.js') ];
            webpackConfig.output = {
                path: pathResolver.compiled(),
                filename: jsFileName,
                library: 'core',
                libraryTarget: 'umd'
            };
        }

        if (PRODUCTION) {
            webpackConfig.output.filename = UGLIFY ? jsFileNameMin : jsFileName;

            webpackConfig.debug = false;
            webpackConfig.devtool = 'source-map';

            //noinspection JSUnresolvedFunction
            webpackConfig.plugins.push(
                new webpack.optimize.OccurrenceOrderPlugin(),
                new webpack.optimize.DedupePlugin()
            );

            if (UGLIFY) {
                webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        unused: true,
                        dead_code: true,
                        warnings: false
                    },
                    comments: false
                }));
            }
        }

        return webpackConfig;
    }
};
