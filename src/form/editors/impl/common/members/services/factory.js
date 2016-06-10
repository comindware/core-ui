/**
 * Developer: Stepan Burguchev
 * Date: 8/19/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import MembersCollection from '../collections/MembersCollection';
import MembersListView from '../views/MembersListView';
import UserService from 'services/UserService';
import 'libApi';
import 'utils/utilsApi';

export default {
    createMembersCollection: function () {
        var membersCollection = new MembersCollection();
        membersCollection.reset(UserService.listUsers());
        return membersCollection;
    },

    createMembersListView: function (options) {
        return new MembersListView(options);
    },

    getMembersListView: function () {
        return MembersListView;
    }
};
