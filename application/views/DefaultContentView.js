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
    'text!../templates/defaultContent.html',
    './content/HeaderTabsView',
    '../collections/SelectableCollection',
    './ModuleLoadingView'
], function (lib, utilsApi, template, HeaderTabsView, SelectableCollection, ModuleLoadingView) {
        'use strict';

        return Marionette.LayoutView.extend({
            initialize: function () {
                this.model = new Backbone.Model();
                this.model.set('headerTabs', new SelectableCollection([]));
            },

            template: Handlebars.compile(template),

            className: 'dev-default-content-view',

            regions: {
                headerTabsRegion: '.js-header-tabs-region',
                moduleRegion: '.js-module-region',
                moduleLoadingRegion: '.js-module-loading-region'
            },

            onRender: function () {
                this.headerTabsRegion.show(new HeaderTabsView({
                    collection: this.model.get('headerTabs')
                }));
            },

            setHeaderTabs: function (tabs) {
                this.model.get('headerTabs').reset(tabs);
            },

            selectHeaderTab: function (tabId) {
                var tabModel = this.findTabModel(tabId);
                if (!tabModel) {
                    utilsApi.helpers.throwError('Failed to filed tab item with id `' + tabId + '`');
                }
                tabModel.select();
            },

            findTabModel: function (tabId) {
                return this.model.get('headerTabs').findWhere({id: tabId}) || null;
            },

            setModuleLoading: function (visible) {
                if (visible) {
                    this.moduleLoadingRegion.show(new ModuleLoadingView());
                } else {
                    this.moduleLoadingRegion.reset();
                }
            }
        });
    });
