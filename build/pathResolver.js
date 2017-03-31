/**
 * Developer: Stepan Burguchev
 * Date: 11/30/2016
 * Copyright: 2009-2016 ApprovalMax
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF ApprovalMax
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

'use strict';

const path = require('path');
const _ = require('underscore');

const rootDir = path.resolve(__dirname, '../');

const resolve = function (baseDir, nextDir, args) {
    let pathArray = [baseDir];
    if (nextDir) {
        pathArray.push(nextDir);
    }
    return path.resolve.apply(path.resolve, pathArray.concat(_.toArray(args)));
};

module.exports = {
    createResolver: function (baseDir) {
        return function () {
            return resolve(baseDir, null, arguments);
        };
    },

    resources: function () {
        return resolve(rootDir, 'resources', arguments);
    },
    node_modules: function () {
        return resolve(rootDir, 'node_modules', arguments);
    },
    compiled: function () {
        return resolve(rootDir, 'dist', arguments);
    },
    pages: function () {
        return resolve(rootDir, 'pages', arguments);
    },
    demo: function () {
        return resolve(rootDir, 'demo', arguments);
    },
    source: function () {
        return resolve(rootDir, 'src', arguments);
    },
    tests: function () {
        return resolve(rootDir, 'tests', arguments);
    },
    localizationSource: function () {
        return resolve(rootDir, 'localization', arguments);
    },
    root: function () {
        return resolve(rootDir, null, arguments);
    }
};
