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
    'core/services/GlobalEventService',
    './content/ProfileButtonView',
    './content/ProfilePanelView',
    './content/EllipsisButtonView'
], function (lib, utilsApi, dropdownApi, template, HeaderTabsView, SelectableCollection, ModuleLoadingView,
             RoutingService, GlobalEventService, ProfileButtonView, ProfilePanelView, EllipsisButtonView) {
        'use strict';

        var constants = {
            RESIZE_HANDLER_DELAY: 100,
            FULL_HEADER_TABS_WIDTH_OFFSET: 30
        };

        var classes = {
            TABS_CONTAINER_WITH_BACK: 'dev-default-content-view__header__tabs-container_with-back-button'
        };

        return Marionette.LayoutView.extend({
            initialize: function () {
                this.model = new Backbone.Model();
                this.model.set('headerTabs', new SelectableCollection());
                this.model.set('visibleHeaderTabs', new Backbone.Collection());
                this.model.set('hiddenHeaderTabs', new Backbone.Collection());

                _.bindAll(this, '__updateHeaderTabs');

                var onResize = _.debounce(this.__updateHeaderTabs, constants.RESIZE_HANDLER_DELAY);

                this.listenTo(this.model.get('headerTabs'), 'add remove reset', this.__updateHeaderTabs);
                this.listenTo(GlobalEventService, 'resize', onResize);
            },

            template: Handlebars.compile(template),

            className: 'dev-default-content-view',

            ui: {
                backButton: '.js-back-button',
                backButtonText: '.js-back-button-text',
                headerTabsContainer: '.js-header-tabs-container',
                headerTabs: '.js-header-tabs-region',
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
                this.rendering = true;
                this.hideBackButton();

                this.headerTabsView = new HeaderTabsView({
                    collection: this.model.get('visibleHeaderTabs')
                });
                this.headerTabsRegion.show(this.headerTabsView);

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
                this.rendering = false;

                this.__updateHeaderTabs();
            },

            setHeaderTabs: function (tabs) {
                this.model.get('headerTabs').reset(tabs);
            },

            __updateHeaderTabs: function () {
                if (this.rendering) {
                    return;
                }
                var tabsContainerWidth = this.ui.headerTabsContainer.width();
                var newModels = this.model.get('headerTabs').models;

                this.model.get('visibleHeaderTabs').reset(newModels);
                var widths = this.headerTabsView.getWidths();
                var sumFn = function (m, e) {
                    return m + e;
                };
                var visibleCount = 0;
                for (var i = 0; i < widths.length; i++) {
                    var fullTabsWidth = _.reduce(_.take(widths, widths.length - i), sumFn, 0);
                    if (fullTabsWidth < tabsContainerWidth - constants.FULL_HEADER_TABS_WIDTH_OFFSET) {
                        visibleCount = widths.length - i;
                        break;
                    }
                }

                this.model.get('visibleHeaderTabs').reset(_.take(newModels, visibleCount));
                this.model.get('hiddenHeaderTabs').reset(_.rest(newModels, visibleCount));
                if (visibleCount === newModels.length) {
                    this.ui.headerTabsMenu.hide();
                } else {
                    this.ui.headerTabsMenu.show();
                }
            },

            showBackButton: function (options) {
                utilsApi.helpers.ensureOption(options, 'url');
                this.backButtonOptions = options;
                if (options.name) {
                    this.ui.backButtonText.text(options.name);
                }
                this.ui.backButton.show();
                this.ui.headerTabsContainer.addClass(classes.TABS_CONTAINER_WITH_BACK);
                this.__updateHeaderTabs();
            },

            hideBackButton: function () {
                this.ui.backButton.hide();
                this.ui.headerTabsContainer.removeClass(classes.TABS_CONTAINER_WITH_BACK);
                this.__updateHeaderTabs();
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
