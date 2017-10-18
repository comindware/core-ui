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

const fs = require('fs');
const exec = require('child_process').exec;

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

    !fs.existsSync(pathResolver.compiled()) && fs.mkdirSync(pathResolver.compiled());
    !fs.existsSync(pathResolver.compiled('localization')) && fs.mkdirSync(pathResolver.compiled('localization'));
    if (!fs.existsSync(pathResolver.compiled('localization/temp'))) {
        fs.mkdirSync(pathResolver.compiled('localization/temp'));
    }

    try {
        exec(localizationCommand, (err, stdout, stderr) => {
            if (err) {
                console.error('Cannot find localization.exe. Please ensure what Localization tool have been installed.');
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

            const deleteFolderRecursive = path => {
                if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach(file => {
                        const curPath = `${path}/${file}`;
                        if (fs.lstatSync(curPath).isDirectory()) {
                            deleteFolderRecursive(curPath);
                        } else {
                            fs.unlinkSync(curPath);
                        }
                    });
                    fs.rmdirSync(path);
                }
            };
            deleteFolderRecursive(pathResolver.compiled('localization/temp/'));

            callback(err);
        });
    } catch (e) {
        console.log('Failed to start localization tool. Considering it unimportant and continue.');
        callback();
    }
};
