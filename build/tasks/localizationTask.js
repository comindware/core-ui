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

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}], no-new-func: 0 */

'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const mkdirp = require('mkdirp');
const del = require('del');

const pathResolver = require('../pathResolver');

// ###
// This task requires Comindware Localization Tool to be installed in PATH.
// ###

module.exports = callback => {
    const localizerBin = 'Localization.Export.exe';
    const localizationResources = 'http://comindware.com/text#core';
    const localizationSource = pathResolver.localizationSource('localization.n3');
    const localizationDestination = pathResolver.compiled('localization/temp/localization.js');

    const localizationCommand = `${localizerBin} --export js --source "${localizationSource}" --destination "${localizationDestination}"` +
        ` -r ${localizationResources} --languages en ru de`;

    mkdirp.sync(pathResolver.compiled('localization/temp'));

    try {
        exec(localizationCommand, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                callback();
                return;
            }
            console.log(stdout);
            console.log(stderr);

            fs.readdirSync(pathResolver.compiled('localization/temp')).forEach(fileName => {
                const langCode = fileName.substr(16, 2);
                let fileContent = fs.readFileSync(pathResolver.compiled(`localization/temp/${fileName}`), 'utf8');
                // We call Function because the fileContent still isn't a valid JSON.
                fileContent = `return ${fileContent.substring(fileContent.indexOf('var LANGMAP') + 16)}`;
                const data = (new Function(fileContent))(); // jshint ignore:line
                fs.writeFileSync(pathResolver.compiled(`localization/localization.${langCode}.json`), JSON.stringify(data), 'utf8');
            });
            del.sync([pathResolver.compiled('localization/temp/**')], { force: true });

            callback(err);
        });
    } catch (e) {
        console.log('Failed to start localization tool. Considering it unimportant and continue.');
        callback();
    }
};
