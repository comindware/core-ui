/**
 * Developer: Alexander Makarov
 * Date: 08.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['text!../templates/moduleView.html', './GroupsListView', './CasesListView', '../collections/CasesCollection',
        '../collections/GroupsCollection', '../CasesConfig', './CaseModuleView'],
    function(template, GroupsListView, CasesListView, CasesCollection, GroupsCollection, config, CaseModuleView) {
        'use strict';

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                this.activeSectionId = options.activeSectionId;
                this.activeGroupId = options.activeGroupId;
                this.activeCaseId = options.activeCaseId;
            },

            className: 'demo-page',

            template: Handlebars.compile(template),

            regions: {
                groupsList: '.js-groups-list-region',
                casesList: '.js-cases-list-region',
                caseModule: '.js-case-module-region'
            },

            onShow: function () {
                var availableGroups = this.getAvailableGroups(),
                    availableCases = this.getAvailableCases(availableGroups),
                    activeCase = this.getActiveCase(availableCases);

                var groupsCollection = new GroupsCollection(availableGroups),
                    activeGroupModel = groupsCollection.findWhere({id: activeCase.groupId});
                groupsCollection.select(activeGroupModel);

                this.groupsList.show(new GroupsListView({
                        collection: groupsCollection
                    })
                );
                this.casesList.show(new CasesListView({
                        collection: new CasesCollection(availableCases)
                    })
                );
                this.caseModule.show(new CaseModuleView({
                        model: new Backbone.Model(activeCase)
                    })
                );
            },

			getModuleUrlByName: function (options) {
                var url = 'demo/core/:section/:group/:case';
                var result = [];
                var lastIndex = 0;
                var match;
                var re = /:[^/]+(?=\/|$)/g;
                while (true) {
                    match = re.exec(url);
                    if (!match) {
                        break;
                    }
                    result.push(url.substring(lastIndex, match.index));
                    var param = match[0].substring(1);
                    var opt = options[param];
                    if (!opt) {
                        core.utils.helpers.throwFormatError('Missing url options `' + param + '`.');
                    }
                    result.push(opt);
                    lastIndex = match.index + param.length + 1;
                }
                result.push(url.substring(lastIndex));
                var resultUrl = result.join('');
                if (resultUrl[0] !== '#') {
                    resultUrl = '#' + resultUrl;
                }
                return resultUrl;
            },

            getAvailableGroups: function(){
                var activeSection = _.find(config.sections, function(section) {
                    return section.id.toLowerCase() === this.activeSectionId.toLowerCase();
                }, this);

                return _.map(activeSection.groups, function (group) {
                    var url = this.getModuleUrlByName({
                        section: activeSection.id,
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

            getAvailableCases: function() {
                var activeSection = _.find(config.sections, function(section) {
                    return section.id === this.activeSectionId;
                }, this);
                var activeGroup = _.find(activeSection.groups, function(group) {
                    return group.id.toLowerCase() === this.activeGroupId.toLowerCase();
                }, this);

                return _.map(activeGroup.cases, function(c) {
                    var url = this.getModuleUrlByName({
                        section: this.activeSectionId,
                        group: this.activeGroupId,
                        case: c.id
                    });
                    return {
                        id: c.id,
                        displayName: c.displayName,
                        description: c.description,
                        url: url,
                        sectionId: this.activeSectionId,
                        groupId: this.activeGroupId
                    };
                }, this);
            },

            getActiveCase: function(availableCases) {
                var activeCase = _.find(availableCases, function(c) {
                    return c.id.toLowerCase() === this.activeCaseId.toLowerCase();
                }, this);
                if (activeCase) {
                    return activeCase;
                }

                var activeSection = _.find(config.sections, function(section) {
                    return section.id === this.activeSectionId;
                }, this);
                var activeGroup = _.find(activeSection.groups, function(group) {
                    return group.id.toLowerCase() === this.activeGroupId.toLowerCase();
                }, this);
                var url = this.getModuleUrlByName({
                    section: this.activeSectionId,
                    group: this.activeGroupId,
                    case: 'default'
                });
                return {
                    id: null,
                    displayName: activeGroup.displayName,
                    description: activeGroup.description,
                    url: url,
                    sectionId: this.activeSectionId,
                    groupId: this.activeGroupId
                };
            }
        });
    });
