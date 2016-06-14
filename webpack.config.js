/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global module, __dirname */

"use strict";

const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const _ = require('lodash');

const pathResolver = {
    client: function () {
        //noinspection Eslint
        return path.resolve.apply(path.resolve, [__dirname, 'dist'].concat(_.toArray(arguments)));
    },
    source: function () {
        //noinspection Eslint
        return path.resolve.apply(path.resolve, [__dirname, 'src'].concat(_.toArray(arguments)));
    },
    thisDir: function () {
        return path.resolve(__dirname);
    },
    stylesDir: function () {
        return path.resolve(__dirname, "./resources/styles");
    }
};

module.exports = {
    build: function (options) {
        const DEVELOPMENT = options.env === 'development';
        const PRODUCTION = options.env === 'production';
        const TEST = options.env === 'test';

        const FONT_LIMIT = PRODUCTION ? 10000 : 1000000;
        const GRAPHICS_LIMIT = PRODUCTION ? 10000 : 1000000;

        let webpackConfig = {
            cache: true,
            entry: pathResolver.source('coreApi.js'),
            devtool: TEST ? 'inline-source-map' : 'source-map',
            debug: true,
            output: {
                path: pathResolver.client(),
                filename: "core.bundle.js",
                library: 'core',
                libraryTarget: 'umd'
            },
            module: {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        exclude: /(node_modules|bower_components)/,
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
                        test: /\.hbs$/,
                        loader: `handlebars-loader?helperDirs[]=${pathResolver.source('utils/handlebars')}`
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
                        test: /\.html$/,
                        loader: "html"
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
                        test: /jquery\.caret/,
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
                        test: /backbone.forms\.js/,
                        loader: 'imports?backbone!imports?underscore!imports?jquery'
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
                    pathResolver.stylesDir()
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
                (PRODUCTION ? new ExtractTextPlugin('styles.bundle.min.css') : new ExtractTextPlugin('styles.bundle.css'))
            ],
            resolve: {
                root: [
                    pathResolver.thisDir(),
                    pathResolver.source()
                ],
                alias: {
                    "jquery.caret": pathResolver.source('lib/jquery.caret/index'),
                    "backbone.forms": pathResolver.source('lib/backbone.forms/backbone-forms'),
                    "keypress": pathResolver.source('lib/Keypress/keypress-2.1.0.min'),
                    "handlebars": 'handlebars/dist/handlebars'
                }
            }
        };

        if (PRODUCTION) {
            webpackConfig.output.filename = 'core.bundle.min.js';

            webpackConfig.cache = false;
            webpackConfig.debug = false;
            webpackConfig.devtool = 'source-map';

            //noinspection JSUnresolvedFunction
            webpackConfig.plugins.push(
                new ExtractTextPlugin('[name].css'),
                new webpack.optimize.OccurrenceOrderPlugin(),
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        unused: true,
                        dead_code: true,
                        warnings: false
                    }
                })
            );
        }

        return webpackConfig;
    }
};
