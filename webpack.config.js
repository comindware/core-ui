/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global module, __dirname */

"use strict";
var path = require('path');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    build: function (options) {
        const DEVELOPMENT = options.env === 'development';
        const PRODUCTION = options.env === 'production';
        const TEST = options.env === 'test';

        const FONT_LIMIT = PRODUCTION ? 10000 : 1000000;
        const GRAPHICS_LIMIT = PRODUCTION ? 10000 : 1000000;

        return {
            cache: true,
            entry: './js/core/coreApi.js',
            devtool: 'eval',
            debug: true,
            output: {
                path: __dirname + '/dist',
                filename: "core.bundle.js",
                library: 'core',
                libraryTarget: 'umd'
            },
            module: {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        exclude: /(node_modules|bower_components)/,
                        loader: 'babel',
                        query: {
                            presets: ["es2015"],
                            plugins: ["transform-es2015-modules-commonjs"]
                        }
                    },
                    {
                        test: /\.hbs$/,
                        loader: "handlebars-loader?helperDirs[]=" + __dirname + "/js/core/utils/handlebars"
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
                        test: /bluebird/,
                        loader: 'expose?Promise'
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
                    path.resolve(__dirname, "./resources/styles")
                ]
            },
            postcss: [
                autoprefixer({
                    browsers: ['last 2 versions']
                })
            ],
            plugins: [
                new ExtractTextPlugin('styles.bundle.css')
            ],
            resolve: {
                root: [
                    path.resolve(__dirname),
                    path.resolve(__dirname + '/js/core')
                ],
                alias: {
                    "jquery.caret": 'js/lib/jquery.caret/index',
                    "backbone.forms": 'js/lib/backbone.forms/backbone-forms',
                    "keypress": 'js/lib/Keypress/keypress-2.1.0.min',
                    "handlebars": 'handlebars/dist/handlebars'
                }
            }
        };
    }
};
