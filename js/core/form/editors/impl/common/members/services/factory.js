/**
 * Developer: Stepan Burguchev
 * Date: 8/19/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    '../collections/MembersCollection',
    'core/libApi',
    'core/dropdown/dropdownApi',
    'core/utils/utilsApi',
    'core/serviceLocator',
    '../views/MembersListView'
], function (
    MembersCollection,
    lib,
    dropdown,
    utils,
    serviceLocator,
    MembersListView
) {
    'use strict';

    return {
        createMembersCollection: function () {
            var users = serviceLocator.cacheService.GetUsers();
            var members = [];

            _.each(users, function(model) {
                //noinspection JSUnresolvedVariable
                members.push({
                    id: model.Id,
                    name: (model.Text || model.Username),
                    userName: model.Username,
                    abbreviation: model.abbreviation,
                    avatarUrl: model.userpicUrl,
                    link: model.link
                });
            });

            var membersCollection = new MembersCollection();
            membersCollection.reset(members);
            return membersCollection;
        },

        createMembersListView: function (options) {
            return new MembersListView(options);
        },

        getMembersListView: function () {
            return MembersListView;
        }
    };
});
