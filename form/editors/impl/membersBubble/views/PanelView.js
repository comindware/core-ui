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

define(['module/core', './ListItemView', 'text!../templates/panel.html'],
    function (core, ListItemView, template) {
        'use strict';

        var config = {
            CHILD_HEIGHT: 34
        };

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
                this.collection = this.model.get('available');
            },
            template: Handlebars.compile(template),

            className: 'dev-members-container',

            regions: {
                listRegion: '.js-list-region',
                scrollbarRegion: '.js-scrollbar-region'
            },

            onShow: function () {
                this.availableList = core.list.factory.createDefaultList({
                    collection: this.collection,
                    listViewOptions: {
                        childView: ListItemView,
                        childViewOptions: {
                            reqres: this.reqres
                        },
                        childHeight: config.CHILD_HEIGHT
                    }
                });
                this.listRegion.show(this.availableList.listView);
                this.scrollbarRegion.show(this.availableList.scrollbarView);
            },

            handleCommand: function(command, options) {
                switch (command) {
                case 'up':
                    this.availableList.listView.moveCursorBy(-1, false);
                    break;
                case 'down':
                    this.availableList.listView.moveCursorBy(1, false);
                    break;
                }
            }
        });
    });
