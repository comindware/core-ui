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

const del = require('del');

const pathResolver = require('../pathResolver');

module.exports = () => {
    del.sync([
        pathResolver.compiled('**'),
        `!${pathResolver.compiled()}`,
        `!${pathResolver.compiled('localization')}`,
        `!${pathResolver.compiled('localization/*.json')}`
    ], { force: true });
};
