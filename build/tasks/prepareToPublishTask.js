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

const exec = require('child_process').exec;
const fs = require('fs');

const pathResolver = require('../pathResolver');

const removeBom = (text) => {
    return text.replace(/^\uFEFF/, '');
};

module.exports = callback => {
    exec('git tag --contains HEAD', function (err, stdout, stderr) {
        if (err) {
            console.error(err);
            return;
        }

        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.log(stderr);
        }

        let matchResult = /^v(.+)$/gm.exec(stdout);
        if (matchResult === null) {
            console.log('PrepareToPublishTask: no tags found, skip package.json update.');
            return;
        }
        const version = matchResult[matchResult.length - 1];

        console.log(`PrepareToPublishTask: There are tags on the build that match the version pattern. Updating package.json with version ${version}...`);
        let packageJson = JSON.parse(removeBom(fs.readFileSync(pathResolver.root('package.json'), 'utf8')));
        packageJson.version = version;
        fs.writeFileSync(pathResolver.root('package.json'), JSON.stringify(packageJson, null, '    '), 'utf8');
    });
};
