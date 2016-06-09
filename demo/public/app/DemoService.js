/**
 * Developer: Stepan Burguchev
 * Date: 6/7/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    './DemoConfig'
], function (config) {
    'use strict';

    function findDefaultGroup(sectionId) {
        var section = _.find(config.sections, function(section) {
            return sectionId.toLowerCase() === section.id.toLowerCase();
        });
        var defaultGroupId = section.groups[0].id;
        return _.find(section.groups, function(group) {
            return defaultGroupId.toLowerCase() === group.id.toLowerCase();
        });
    }

    return {
        getModuleUrlByName: function (options) {
            return '#demo/' + options.section + '/' + options.group + '/' + options.case;
        },

        getSections: function () {
            return _.map(config.sections, function (section) {
                var group = findDefaultGroup(section.id);
                var url = this.getModuleUrlByName({
                    section: section.id,
                    group: group.id,
                    case: group.cases ? group.cases[0].id : 'default'
                });
                return {
                    id: section.id,
                    displayName: section.displayName,
                    url: url
                };
            }, this);
        },

        getGroups: function (sectionId) {
            var section = _.find(config.sections, function(s) {
                return s.id.toLowerCase() === sectionId.toLowerCase();
            });

            return _.map(section.groups, function (group) {
                var url = this.getModuleUrlByName({
                    section: section.id,
                    group: group.id,
                    case: group.cases ? group.cases[0].id : 'default'
                });
                return {
                    id: group.id,
                    displayName: group.displayName,
                    url: url
                };
            }, this);
        },

        getCases: function (sectionId, groupId) {
            var section = _.find(config.sections, function(s) {
                return s.id === sectionId;
            });
            var group = _.find(section.groups, function(g) {
                return g.id.toLowerCase() === groupId.toLowerCase();
            });

            return _.map(group.cases, function(c) {
                var url = this.getModuleUrlByName({
                    section: sectionId,
                    group: groupId,
                    case: c.id
                });
                return {
                    id: c.id,
                    displayName: c.displayName,
                    description: c.description,
                    url: url,
                    sectionId: sectionId,
                    groupId: groupId
                };
            }, this);
        },

        getCase: function(sectionId, groupId, caseId) {
            var cases = this.getCases(sectionId, groupId);
            var activeCase = _.find(cases, function(c) {
                return c.id.toLowerCase() === caseId.toLowerCase();
            }, this);
            if (activeCase) {
                return activeCase;
            }

            var activeSection = _.find(config.sections, function(section) {
                return section.id === sectionId;
            });
            var activeGroup = _.find(activeSection.groups, function(group) {
                return group.id.toLowerCase() === groupId.toLowerCase();
            });
            var url = this.getModuleUrlByName({
                section: sectionId,
                group: groupId,
                case: 'default'
            });
            return {
                id: null,
                displayName: activeGroup.displayName,
                description: activeGroup.description,
                url: url,
                sectionId: sectionId,
                groupId: groupId
            };
        }
    };
});
