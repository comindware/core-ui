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

const run = (cmd, cwd) => {
    execSync(`${cmd}`, {
        cwd,
        stdio: 'inherit'
    });
};

const copyDemo = (resolver) => {
    run('npm run build', pathResolver.demo());
    fs.copySync(pathResolver.demo('public/assets'), resolver());
};

const copyDoc = (resolver) => {
    fs.copySync(pathResolver.root('doc'), resolver('doc'));
};

module.exports = () => {
    const token = process.env.GH_TOKEN;
    const ref = process.env.GH_REF;

    const pagesDir = pathResolver.pages();
    const pagesResolver = pathResolver.createResolver(pagesDir);
    mkdirp.sync(pagesDir);
    run('git init', pagesDir);
    run('git config user.name "Travis-CI"', pagesDir);
    run('git config user.email "Stanislav.Guryev@comindware.com"', pagesDir);
    copyDemo(pagesResolver);
    copyDoc(pagesResolver);
    run('git add -A', pagesDir);
    run('git commit -m "Auto-deploy to Github Pages"', pagesDir);
    //run(`git push --force --quiet "https://${token}@${ref}" master:gh-pages`, pagesDir);
};
