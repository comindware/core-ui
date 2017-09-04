/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pathResolver = require('./pathResolver');

const jsFileName = 'core.js';
const jsFileNameMin = 'core.min.js';
const cssFileName = 'core.css';
const cssFileNameMin = 'core.min.css';

module.exports = options => {
    const DEVELOPMENT = options.env === 'development';
    const PRODUCTION = options.env === 'production';
    const TEST_COVERAGE = options.env === 'test-coverage';
    const TEST = options.env === 'test' || TEST_COVERAGE;
    const UGLIFY = options.uglify || false;

    const FONT_LIMIT = PRODUCTION ? 10000 : 1000000;
    const GRAPHICS_LIMIT = PRODUCTION ? 10000 : 1000000;

    const webpackConfig = {
        cache: true,
        devtool: TEST ? 'inline-source-map' : 'source-map',
        module: {
            rules: [{
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components|src\/external\/)/,
                loader: 'babel-loader',
                query: {
                    presets: ['latest'],
                    cacheDirectory: true,
                    plugins: []
                }
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'css-loader'
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            config: {
                                ctx: {
                                    autoprefixer: {
                                        browsers: ['last 2 versions']
                                    }
                                }
                            }
                        }
                    }]
                })
            }, {
                test: /\.hbs$/,
                loader: 'html-loader'
            }, {
                test: /\.html$/,
                loader: 'html-loader'
            }, {
                test: /\.woff(\?.*)?$/,
                loader: `url-loader?prefix=fonts/&name=[path][name].[ext]&limit=${FONT_LIMIT}&mimetype=application/font-woff`
            }, {
                test: /\.woff2(\?.*)?$/,
                loader: `url-loader?prefix=fonts/&name=[path][name].[ext]&limit=${FONT_LIMIT}&mimetype=application/font-woff2`
            }, {
                test: /\.otf(\?.*)?$/,
                loader: `file-loader?prefix=fonts/&name=[path][name].[ext]&limit=${FONT_LIMIT}&mimetype=font/opentype`
            }, {
                test: /\.ttf(\?.*)?$/,
                loader: `url-loader?prefix=fonts/&name=[path][name].[ext]&limit=${FONT_LIMIT}&mimetype=application/octet-stream`
            }, {
                test: /\.eot(\?.*)?$/,
                loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]'
            }, {
                test: /\.svg(\?.*)?$/,
                loader: `url-loader?prefix=fonts/&name=[path][name].[ext]&limit=${GRAPHICS_LIMIT}&mimetype=image/svg+xml`
            }, {
                test: /\.(png|jpg)$/,
                loader: `url-loader?limit=${GRAPHICS_LIMIT}`
            }, {
                test: /jquery-autosize/,
                loader: 'imports-loader?jquery'
            }, {
                test: /rangyinputs/,
                loader: 'imports-loader?jquery'
            }, {
                test: /jquery\.inputmask/,
                loader: 'imports-loader?jquery'
            }, {
                test: /bootstrap-datetime-picker/,
                loader: 'imports-loader?jquery'
            }, {
                test: /backbone\.marionette\.js/,
                use: [{
                    loader: 'expose-loader',
                    options: 'Marionette'
                }]
            }, {
                test: /backbone\.js/,
                use: [{
                    loader: 'expose-loader',
                    options: 'Backbone'
                }]
            }, {
                test: /moment\.js/,
                use: [{
                    loader: 'expose-loader',
                    options: 'moment'
                }]
            }, {
                test: /handlebars\.js/,
                use: [{
                    loader: 'expose-loader',
                    options: 'Handlebars'
                }]
            }, {
                test: /underscore\.js/,
                use: [{
                    loader: 'expose-loader',
                    options: '_'
                }]
            }, {
                test: /jquery\.js/,
                use: [{
                    loader: 'expose-loader',
                    options: '$'
                }, {
                    loader: 'expose-loader',
                    options: 'jQuery'
                }]
            }]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': PRODUCTION ? '"production"' : '"development"',
                __DEV__: !PRODUCTION
            }),
            new ExtractTextPlugin({
                filename: UGLIFY ? cssFileNameMin : cssFileName
            }),
            new webpack.optimize.ModuleConcatenationPlugin()
        ],
        resolve: {
            modules: [
                pathResolver.source(),
                pathResolver.node_modules()
            ],
            alias: {
                rangyinputs: pathResolver.source('external/rangyinputs/rangyinputs-jquery-src'),
                keypress: pathResolver.source('external/Keypress/keypress-2.1.0.min'),
                handlebars: 'handlebars/dist/handlebars'
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

    if (!TEST) {
        webpackConfig.entry = ['babel-polyfill', pathResolver.source('coreApi.js')];
        webpackConfig.output = {
            path: pathResolver.compiled(),
            filename: jsFileName,
            library: 'core',
            libraryTarget: 'umd'
        };
    }

    if (PRODUCTION) {
        webpackConfig.output.filename = UGLIFY ? jsFileNameMin : jsFileName;
        webpackConfig.devtool = 'source-map';

        webpackConfig.plugins.push(
            new webpack.optimize.OccurrenceOrderPlugin()
        );

        if (UGLIFY) {
            webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        warnings: true,
                        dead_code: true
                    },
                },
                output: {
                    comments: false,
                },
                sourceMap: true,
                parallel: true
            }));
        }
    }

    return webpackConfig;
};
