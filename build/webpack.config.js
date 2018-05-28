const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pathResolver = require('./pathResolver');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const jsFileName = 'core.js';
const jsFileNameMin = 'core.min.js';
const cssFileName = 'core.css';
const cssFileNameMin = 'core.min.css';
const FlowWebpackPlugin = require('flow-webpack-plugin');

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
                        pathResolver.source('Meta.js'),
                        pathResolver.source('utils'),
                        pathResolver.source('form/editors/impl/dateTime/views/DateWidget.js'),
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
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: [pathResolver.node_modules(), pathResolver.source('external/rangyinputs-jquery-src.js')],
                    options: {
                        presets: [
                            ['flow'],
                            [
                                'env',
                                {
                                    targets: {
                                        browsers: ['ie 11', '> 0.25%', 'not chrome 29']
                                    }
                                }
                            ]
                        ],
                        cacheDirectory: true
                    }
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader'
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true,
                                    plugins: () => {
                                        const plugins = [
                                            autoprefixer({
                                                browsers: ['ie 11', '> 0.25%', 'not chrome 29']
                                            })
                                        ];
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
                    })
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
                    test: /\.eot(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        prefix: 'fonts/',
                        name: '[path][name].[ext]',
                        limit: FONT_LIMIT,
                        mimetype: 'application/font-eot'
                    }
                },
                {
                    test: /\.ttf(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        prefix: 'fonts/',
                        name: '[path][name].[ext]',
                        limit: FONT_LIMIT,
                        mimetype: 'application/font-ttf'
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
                    test: /\.otf(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        prefix: 'fonts/',
                        name: '[path][name].[ext]',
                        limit: FONT_LIMIT,
                        mimetype: 'font/opentype'
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
                    test: /jquery-autosize/,
                    use: [
                        {
                            loader: 'imports-loader',
                            options: 'jquery'
                        }
                    ]
                },
                {
                    test: /rangyinputs/,
                    use: [
                        {
                            loader: 'imports-loader',
                            options: 'jquery'
                        }
                    ]
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
                    test: /underscore\.js/,
                    use: [
                        {
                            loader: 'expose-loader',
                            options: '_'
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
            new ExtractTextPlugin({
                filename: UGLIFY ? cssFileNameMin : cssFileName
            }),
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|ru|en/),
            new FlowWebpackPlugin()
        ],
        resolve: {
            modules: [pathResolver.source(), pathResolver.node_modules()],
            alias: {
                rangyinputs: pathResolver.source('external/rangyinputs-jquery-src'),
                'backbone.trackit': pathResolver.source('external/backbone.trackit.js'),
                'jquery-ui': pathResolver.source('external/jquery-ui.js'),
                handlebars: 'handlebars/dist/handlebars',
                localizationMap: pathResolver.compiled('localization/localization.en.json')
            }
        },
        devServer: {
            noInfo: true,
            stats: 'minimal'
        }
    };

    if (!TEST) {
        webpackConfig.entry = ['babel-polyfill', pathResolver.source('coreApi.js')];
        webpackConfig.output = {
            path: pathResolver.compiled(),
            filename: jsFileName,
            library: 'core',
            libraryTarget: 'umd'
        };
        if (options.clean !== false) {
            webpackConfig.plugins.push(
                new CleanWebpackPlugin([pathResolver.compiled()], {
                    root: pathResolver.root(),
                    verbose: false,
                    exclude: ['localization']
                })
            );
        }
    }
    if (TEST_COVERAGE) {
        webpackConfig.module.rules.push({
            test: /\.js$|\.jsx$/,
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
