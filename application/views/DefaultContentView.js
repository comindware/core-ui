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
    './content/ProfilePanelView',
    './content/EllipsisButtonView'
], function (lib, utilsApi, dropdownApi, template, HeaderTabsView, SelectableCollection, ModuleLoadingView,
             RoutingService, ProfileButtonView, ProfilePanelView, EllipsisButtonView) {
        'use strict';

        return Marionette.LayoutView.extend({
            initialize: function () {
                this.model = new Backbone.Model();
                this.model.set('headerTabs', new SelectableCollection());
                this.model.set('visibleHeaderTabs', new Backbone.Collection());
                this.model.set('hiddenHeaderTabs', new Backbone.Collection());

                this.listenTo(this.model.get('headerTabs'), 'add remove reset', this.__updateHeaderTabs);
            },

            template: Handlebars.compile(template),

            className: 'content-view',

            ui: {
                backButton: '.js-back-button',
                backButtonText: '.js-back-button-text',
                headerTabsMenu: '.js-header-tabs-menu-region'
            },

            events: {
                'click @ui.backButton': '__back'
            },

            regions: {
                headerTabsRegion: '.js-header-tabs-region',
                headerTabsMenuRegion: '.js-header-tabs-menu-region',
                moduleRegion: '.js-module-region',
                moduleLoadingRegion: '.js-module-loading-region',
                profileRegion: '.js-profile-region'
            },

            onRender: function () {
                this.hideBackButton();

                this.headerTabsRegion.show(new HeaderTabsView({
                    collection: this.model.get('headerTabs')
                }));

                var headerTabsMenuView = dropdownApi.factory.createMenu({
                    buttonView: EllipsisButtonView,
                    items: this.model.get('hiddenHeaderTabs'),
                    customAnchor: true
                });
                this.listenTo(headerTabsMenuView, 'execute', function (modelId, model) {
                    RoutingService.navigateToUrl(model.get('url'));
                });
                this.headerTabsMenuRegion.show(headerTabsMenuView);

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
                this.model.get('visibleHeaderTabs').reset(tabs);
                this.model.get('hiddenHeaderTabs').reset([]);
            },

            __updateHeaderTabs: function () {
                this.ui.headerTabsMenu.hide();
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
