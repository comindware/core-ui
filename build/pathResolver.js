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

const path = require('path');
const _ = require('underscore');

const rootDir = path.resolve(__dirname, '../');

const resolve = function(baseDir, nextDir, args) {
    const pathArray = [baseDir];
    if (nextDir) {
        pathArray.push(nextDir);
    }
    return path.resolve.apply(path.resolve, pathArray.concat(_.toArray(args)));
};

module.exports = {
    createResolver(baseDir) {
        return function() {
            return resolve(baseDir, null, arguments);
        };
    },

    resources() {
        return resolve(rootDir, 'resources', arguments);
    },
    node_modules() {
        return resolve(rootDir, 'node_modules', arguments);
    },
    compiled() {
        return resolve(rootDir, 'dist', arguments);
    },
    pages() {
        return resolve(rootDir, 'pages', arguments);
    },
    demo() {
        return resolve(rootDir, 'demo', arguments);
    },
    source() {
        return resolve(rootDir, 'src', arguments);
    },
    tests() {
        return resolve(rootDir, 'tests', arguments);
    },
    localizationSource() {
        return resolve(rootDir, 'localization', arguments);
    },
    root() {
        return resolve(rootDir, null, arguments);
    }
};
