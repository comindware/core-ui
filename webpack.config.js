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

module.exports = {
    cache: true,
    entry: "./js/core/coreApi.js",
    devtool: 'source-map',
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
                loader: "style!css"
            },
            {
                test: /\.html$/,
                loader: "html"
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
