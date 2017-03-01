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

const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const del = require('del');

const pathResolver = require('../pathResolver');

const run = (cmd, cwd, silent) => {
    let stdout = execSync(`${cmd}`, {
        cwd
    });
    if (!silent) {
        console.log(stdout);
    }
    return stdout;
};

module.exports = callback => {
    const token = process.env.GH_TOKEN;
    const ref = process.env.GH_REF;

    let deployDir = pathResolver.pages();
    mkdirp.sync(deployDir);
    run('git init', deployDir);
    run('git config user.name "Travis-CI"', deployDir);
    run('git config user.email "me@sburg.net"', deployDir);
    fs.copySync(pathResolver.compiled(), pathResolver.pages('dist'));
    run('git commit -am "Auto-deploy to Github Pages"', deployDir);
    run(`git push --force --quiet "https://${token}@${ref}" master:gh-pages`, deployDir);
    run('', deployDir);
};
