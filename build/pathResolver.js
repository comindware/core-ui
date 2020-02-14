const path = require('path');

const rootDir = path.resolve(__dirname, '../');

const resolve = function(baseDir, nextDir, args) {
    const pathArray = [baseDir];
    if (nextDir) {
        pathArray.push(nextDir);
    }
    return path.resolve.apply(path.resolve, pathArray.concat(Array.from(args)));
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
    },
    doc() {
        return resolve(rootDir, 'doc', arguments);
    },
    flowTyped() {
        return resolve(rootDir, 'flow-typed', arguments);
    },
    flowStubs() {
        return resolve(rootDir, 'flow-stubs', arguments);
    }
};
