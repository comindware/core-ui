/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

const cp = require('child_process');

let server;

function startServer(startCommand, startArgs, callback) {
    if (server) {
        server.kill('SIGTERM');
    }

    server = cp.spawn(startCommand, startArgs, {
        env: Object.assign({
            NODE_ENV: 'development'
        }, process.env),
        silent: false
    });

    server.stdout.on('data', x => {
        const time = new Date().toTimeString();
        process.stdout.write(time.replace(/.*(\d{2}:\d{2}:\d{2}).*/, '[$1] '));
        process.stdout.write(x);
    });
    server.stderr.on('data', x => process.stderr.write(x));
    callback();
}

process.on('exit', () => {
    if (server) {
        server.kill('SIGTERM');
    }
});

module.exports = startServer;
