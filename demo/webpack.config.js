const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cssnano = require('cssnano');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const pathResolver = {
    client() {
        return path.resolve.apply(path.resolve, [__dirname, 'public/assets'].concat(Array.from(arguments)));
    },
    source() {
        return path.resolve.apply(path.resolve, [__dirname, 'public'].concat(Array.from(arguments)));
    },
    node_modules() {
        return path.resolve.apply(path.resolve, [__dirname, 'node_modules']);
    }
};

const removeBom = text => text.replace(/^\uFEFF/, '');

const readSpritesFile = () => {
    const svgSpritesFile = `${__dirname}/../dist/themes/main/sprites.svg`;
    return removeBom(fs.readFileSync(svgSpritesFile, 'utf8'));
};

module.exports = () => {
    const PRODUCTION = process.argv.includes('-p');

    const FONT_LIMIT = PRODUCTION ? 10000 : 1000000;
    const GRAPHICS_LIMIT = PRODUCTION ? 10000 : 1000000;

    return {
        mode: PRODUCTION ? 'production' : 'development',
        entry: {
            app: ['./public/index']
        },
        devtool: 'source-map',
        output: {
            path: pathResolver.client(),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        module: {
            rules: [
                PRODUCTION
                    ? {
                          test: /\.css$/,
                          loader: ExtractTextPlugin.extract({
                              fallback: 'style-loader',
                              use: [
                                  {
                                      loader: 'css-loader',
                                      options: {
                                          sourceMap: true
                                      }
                                  },
                                  {
                                      loader: 'postcss-loader',
                                      options: {
                                          sourceMap: true,
                                          plugins: () => [
                                              autoprefixer({
                                                  browsers: ['last 2 versions']
                                              }),
                                              cssnano()
                                          ]
                                      }
                                  }
                              ]
                          })
                      }
                    : {
                          test: /\.css$/,
                          use: [
                              {
                                  loader: 'style-loader'
                              },
                              {
                                  loader: 'css-loader',
                                  options: {
                                      sourceMap: true
                                  }
                              },
                              {
                                  loader: 'postcss-loader',
                                  options: {
                                      sourceMap: true,
                                      plugins: [
                                          autoprefixer({
                                              browsers: ['last 2 versions']
                                          })
                                      ]
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
                        presets: ['env']
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
                    test: /\.(png|jpe?g|gif).*$/,
                    loader: 'url-loader',
                    options: {
                        limit: GRAPHICS_LIMIT
                    }
                }
            ]
        },
        plugins: [
            /*new CleanWebpackPlugin([pathResolver.client()], {
                verbose: false,
                exclude: ['localization']
            }),*/
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: `handlebars-loader!${pathResolver.source('index.hbs')}`,
                hash: PRODUCTION,
                inject: 'body',
                chunks: ['app'],
                minify: {
                    collapseWhitespace: false
                }
            }),
            new WebpackPwaManifest({
                name: 'Comindware business application platform',
                short_name: 'Comindware',
                background_color: '#ffffff',
                display: 'standalone',
                theme_color: '#0575bd',
                orientation: 'landscape-secondary'
            }),
            new ExtractTextPlugin('[name].css'),
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
                }
            ])
        ],
        resolve: {
            modules: [pathResolver.source(), pathResolver.node_modules()],
            alias: {
                'comindware/core': `${__dirname}/../dist/core.js`,
                prism: `${__dirname}/public/lib/prism/prism.js`,
                markdown: `${__dirname}/public/lib/markdown-js/markdown.js`,
                localizationMapEn: `${__dirname}/../dist/localization/localization.en.json`,
                localizationMapDe: `${__dirname}/../dist/localization/localization.de.json`,
                localizationMapRu: `${__dirname}/../dist/localization/localization.ru.json`,
                ajaxMap: `${__dirname}/public/ajax/ajaxMap.js`
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
