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
                if (fs.lstatSync(curPath).isDirectory()) {
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
