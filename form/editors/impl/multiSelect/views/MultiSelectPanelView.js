/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(
    [
        'module/lib',
        'core/list/listApi',
        'core/utils/utilsApi',
        'text!../templates/multiSelectPanel.html',
        './MultiSelectItemView'
    ],
    function(lib, list, utils, template, MultiSelectItemView) {
        'use strict';

        var config = {
            CHILD_HEIGHT: 34,
            MAX_HEIGHT: 410
        };

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                utils.helpers.ensureOption(options, 'model');
            },

            attributes: {
                tabindex: 0
            },

            className: 'dev-panel-view',

            template: Handlebars.compile(template),

            ui: {
                selectAll: '.js-select-all'
            },

            events: {
                'click @ui.selectAll': '__selectAll'
            },

            regions: {
                listRegion: '.js-list-region',
                scrollbarRegion: '.js-scrollbar-region'
            },

            onShow: function () {
                var valueModels = this.model.get('value');

                _.each(valueModels, function(valueModel) {
                    valueModel.set('selected', true);
                });

                var displayList = list.factory.createDefaultList({
                    collection: this.model.get('collection'),
                    listViewOptions: {
                        childView: MultiSelectItemView,
                        childViewOptions: {
                            displayAttribute: this.model.get('displayAttribute')
                        },
                        maxRows: Math.floor(config.MAX_HEIGHT / config.CHILD_HEIGHT),
                        height: 'auto',
                        childHeight: config.CHILD_HEIGHT
                    }
                });

                this.listRegion.show(displayList.listView);
                this.scrollbarRegion.show(displayList.scrollbarView);

                this.$el.focus();
            },

            __selectAll: function () {
                this.model.get('collection').each(function(model) {
                    model.set('selected', true);
                });
            }
        });
    }
);
