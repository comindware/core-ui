/**
 * Developer: Stepan Burguchev
 * Date: 7/1/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'module/lib',
    'core/utils/utilsApi',
    'core/dropdown/dropdownApi',
    'text!../templates/defaultContent.html',
    './content/HeaderTabsView',
    '../collections/SelectableCollection',
    './ModuleLoadingView',
    'core/services/RoutingService',
    './content/ProfileButtonView',
    './content/ProfilePanelView'
], function (lib, utilsApi, dropdownApi, template, HeaderTabsView, SelectableCollection, ModuleLoadingView, RoutingService, ProfileButtonView, ProfilePanelView) {
        'use strict';

        return Marionette.LayoutView.extend({
            initialize: function () {
                this.model = new Backbone.Model();
                this.model.set('headerTabs', new SelectableCollection([]));
            },

            template: Handlebars.compile(template),

            className: 'content-view',

            ui: {
                backButton: '.js-back-button',
                backButtonText: '.js-back-button-text'
            },

            events: {
                'click @ui.backButton': '__back'
            },

            regions: {
                headerTabsRegion: '.js-header-tabs-region',
                moduleRegion: '.js-module-region',
                moduleLoadingRegion: '.js-module-loading-region',
                profileRegion: '.js-profile-region'
            },

            onRender: function () {
                this.hideBackButton();
                this.headerTabsRegion.show(new HeaderTabsView({
                    collection: this.model.get('headerTabs')
                }));
                var currentUser = window.application.currentUser;
                this.profileRegion.show(dropdownApi.factory.createPopout({
                    customAnchor: true,
                    buttonView: ProfileButtonView,
                    buttonViewOptions: {
                        model: currentUser
                    },
                    panelView: ProfilePanelView,
                    panelViewOptions: {
                        model: currentUser
                    }
                }));
            },

            setHeaderTabs: function (tabs) {
                this.model.get('headerTabs').reset(tabs);
            },

            showBackButton: function (options) {
                utilsApi.helpers.ensureOption(options, 'url');
                this.backButtonOptions = options;
                if (options.name) {
                    this.ui.backButtonText.text(options.name);
                }
                this.ui.backButton.show();
            },

            hideBackButton: function () {
                this.ui.backButton.hide();
            },

            selectHeaderTab: function (tabId) {
                var tabModel = this.findTabModel(tabId);
                if (!tabModel) {
                    utilsApi.helpers.throwError('Failed to find a tab item with id `' + tabId + '`');
                }
                tabModel.select();
            },

            findTabModel: function (tabId) {
                return this.model.get('headerTabs').findWhere({id: tabId}) || null;
            },

            setModuleLoading: function (isLoading) {
                if (isLoading) {
                    this.moduleLoadingRegion.show(new ModuleLoadingView());
                } else {
                    this.moduleLoadingRegion.reset();
                }
            },

            __back: function () {
                RoutingService.navigateToUrl(this.backButtonOptions.url);
            }
        });
    });
