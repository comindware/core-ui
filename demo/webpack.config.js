const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const { GenerateSW } = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pathResolver = {
    client() {
        return path.resolve.apply(path.resolve, [__dirname, 'assets'].concat(Array.from(arguments)));
    },
    source() {
        return path.resolve.apply(path.resolve, [__dirname, ''].concat(Array.from(arguments)));
    },
    node_modules() {
        return path.resolve.apply(path.resolve, [__dirname, 'node_modules']);
    }
};

module.exports = () => {
    const PRODUCTION = process.argv.includes('-p');

    const FONT_LIMIT = PRODUCTION ? 10000 : 1000000;
    const GRAPHICS_LIMIT = PRODUCTION ? 10000 : 1000000;

    return {
        mode: PRODUCTION ? 'production' : 'development',
        entry: {
            app: ['./index']
        },
        devtool: 'source-map',
        output: {
            path: pathResolver.client(),
            filename: '[name][hash].js',
            sourceMapFilename: '[file][hash].map'
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: process.env.NODE_ENV === 'development',
                                reloadAll: true
                            }
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                import: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                plugins: [autoprefixer()]
                            }
                        }
                    ]
                },
                {
                    test: /core\.js$/,
                    enforce: 'pre',
                    loader: 'source-map-loader'
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    include: [pathResolver.source()],
                    exclude: [pathResolver.source('lib'), pathResolver.node_modules()],
                    options: {
                        cacheDirectory: true,
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        ie: 11
                                    },
                                    useBuiltIns: 'usage',
                                    corejs: '3.1',
                                    modules: false
                                }
                            ]
                        ],
                        plugins: [require('@babel/plugin-syntax-dynamic-import')]
                    }
                },
                {
                    test: /\.woff2?(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        prefix: 'fonts/',
                        name: '[name].[ext]',
                        limit: FONT_LIMIT,
                        mimetype: 'application/font-woff',
                        outputPath: 'fonts'
                    }
                },
                {
                    test: /\.svg(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        prefix: 'fonts/',
                        outputPath: (url, resourcePath, context) => {
                            if (/@fortawesome/.test(resourcePath)) {
                                return `fonts/${url}`;
                            }

                            return url;
                        },
                        limit: GRAPHICS_LIMIT,
                        mimetype: 'image/svg+xml'
                    }
                },
                {
                    test: /\.(png|jpe?g|gif).*$/,
                    loader: 'url-loader',
                    options: {
                        limit: GRAPHICS_LIMIT
                    }
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'styles.[contenthash].css',
                chunkFilename: '[id].[contenthash].css'
            }),
            new WebpackPwaManifest({
                name: 'Comindware Core-ui demo',
                short_name: 'Core.Demo',
                background_color: '#ffffff',
                display: 'standalone',
                theme_color: '#0575bd',
                orientation: 'landscape-secondary',
                icons: [
                    {
                        src: 'styles/icons/icon-72x72.png',
                        sizes: '72x72',
                        type: 'image/png'
                    },
                    {
                        src: 'styles/icons/icon-96x96.png',
                        sizes: '96x96',
                        type: 'image/png'
                    },
                    {
                        src: 'styles/icons/icon-128x128.png',
                        sizes: '128x128',
                        type: 'image/png'
                    },
                    {
                        src: 'styles/icons/icon-144x144.png',
                        sizes: '144x144',
                        type: 'image/png'
                    },
                    {
                        src: 'styles/icons/icon-152x152.png',
                        sizes: '152x152',
                        type: 'image/png'
                    },
                    {
                        src: 'styles/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'styles/icons/icon-384x384.png',
                        sizes: '384x384',
                        type: 'image/png'
                    },
                    {
                        src: 'styles/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new GenerateSW({
                swDest: pathResolver.client('sw.js'),
                clientsClaim: true,
                skipWaiting: true,
                importWorkboxFrom: 'local',
                directoryIndex: './index.html'
            }),
            new CopyWebpackPlugin([
                {
                    from: `${__dirname}/../dist/themes`,
                    to: pathResolver.client('themes')
                },
                {
                    from: `${__dirname}/../demo/ajaxStub`,
                    to: pathResolver.client('images')
                },
                {
                    from: `${__dirname}/../demo/index.html`,
                    to: pathResolver.client('')
                }
            ]),
            new HtmlWebpackPlugin({
                template: `${__dirname}/../demo/index.html`
            })
        ],
        resolve: {
            modules: [pathResolver.source(), pathResolver.node_modules()],
            alias: {
                'comindware/core': `${__dirname}/../dist/core.js`,
                localizationMapEn: `${__dirname}/../dist/localization/localization.en.json`,
                localizationMapDe: `${__dirname}/../dist/localization/localization.de.json`,
                localizationMapRu: `${__dirname}/../dist/localization/localization.ru.json`,
                ajaxMap: `${__dirname}/ajax/ajaxMap.js`
            }
        },
        resolveLoader: {
            alias: {
                text: 'html'
            }
        },
        stats: {
            colors: true,
            chunks: false,
            source: false,
            hash: false,
            modules: false,
            errorDetails: true,
            version: false,
            assets: false,
            chunkModules: false,
            children: false
        },
        devServer: {
            stats: {
                colors: true,
                chunks: false,
                source: false,
                hash: false,
                modules: false,
                errorDetails: true,
                version: false,
                assets: false,
                chunkModules: false,
                children: false
            },
            port: 3000,
            contentBase: pathResolver.client()
        }
    };
};
