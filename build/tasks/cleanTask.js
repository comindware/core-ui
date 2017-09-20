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
const pathResolver = require('../pathResolver');

module.exports = () => {
    const deleteFolderRecursive = path => {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(file => {
                const curPath = `${path}/${file}`;
                const isTest = process.env === 'test'; //do not delete localization folder, because travis can not in C#
                if (fs.lstatSync(curPath).isDirectory() && (!isTest || path.indexOf('localization') === -1)) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    deleteFolderRecursive(pathResolver.compiled());
};
