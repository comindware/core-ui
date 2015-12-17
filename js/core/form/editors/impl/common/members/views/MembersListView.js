/**
 * Developer: Ksenia Kartvelishvili
 * Date: 20.04.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['core/list/listApi', 'core/utils/utilsApi', './MembersListItemView', 'text!../templates/panel.html'],
    function (list, utils, ListItemView, template) {
        'use strict';

        var config = {
            CHILD_HEIGHT: 34
        };

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                utils.helpers.ensureOption(options, 'collection');
            },

            template: Handlebars.compile(template),

            className: 'dev-members-container',

            regions: {
                listRegion: '.js-list-region',
                scrollbarRegion: '.js-scrollbar-region'
            },

            onShow: function () {
                this.listBundle = list.factory.createDefaultList({
                    collection: this.collection,
                    listViewOptions: {
                        childView: ListItemView,
                        childViewOptions: {
                            reqres: this.reqres
                        },
                        childHeight: config.CHILD_HEIGHT,
                        height: 'auto',
                        maxRows: 12
                    }
                });

                this.listenTo(this.listBundle.listView, 'childview:member:select', function (view, model) {
                    this.trigger('member:select', model);
                }.bind(this));

                this.listRegion.show(this.listBundle.listView);
                this.scrollbarRegion.show(this.listBundle.scrollbarView);
            },

            handleCommand: function(command, options) {
                switch (command) {
                case 'up':
                    this.listBundle.listView.moveCursorBy(-1, false);
                    break;
                case 'down':
                    this.listBundle.listView.moveCursorBy(1, false);
                    break;
                }
            }
        });
    });
