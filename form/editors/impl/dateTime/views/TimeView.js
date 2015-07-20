/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib', 'core/utils/utilsApi', 'core/dropdown/dropdownApi', 'core/list/listApi', 'text!../templates/time.html', './TimeInputView'],
    function (lib, utils, dropdown, list, template, TimeInputView) {
        'use strict';

        return Marionette.LayoutView.extend({
            initialize: function () {
                this.reqres = new Backbone.Wreqr.RequestResponse();
                this.reqres.setHandler('time:selected', this.__onTimeSelected, this);
                this.reqres.setHandler('panel:open', this.__onPanelOpen, this);
                this.reqres.setHandler('panel:close', this.__onPanelClose, this);
            },

            className: 'dev-time-view',

            template: Handlebars.compile(template),

            regions: {
                dropdownRegion: '.js-dropdown-region'
            },

            onRender: function () {
                var timeArray = [];

                for (var h = 0; h < 24; h++) {
                    for (var m = 0; m < 60; m+=30) {
                        var val = {hours: h, minutes: m},
                            time = lib.moment(val),
                            formattedTime = utils.dateHelpers.getDisplayTime(time);

                        timeArray.push({
                            time: time,
                            formattedTime: formattedTime
                        });
                    }
                }

                this.dropdownView = dropdown.factory.createDropdown({
                    buttonView: TimeInputView,
                    buttonViewOptions: {reqres: this.reqres, model: this.model},
                    panelView: Marionette.CollectionView.extend({
                        reqres: this.reqres,
                        collection: new Backbone.Collection(timeArray),
                        tagName: 'ul',
                        className: 'dev-time-dropdown',
                        childView: Marionette.ItemView.extend({
                            tagName: 'li',
                            reqres: this.reqres,
                            events: {
                                'click': '__handleClick'
                            },
                            __handleClick: function () {
                                //noinspection JSPotentiallyInvalidUsageOfThis
                                this.reqres.request('time:selected', this.model.get('time').toString());
                            },
                            template: Handlebars.compile('{{this.formattedTime}}')
                        })
                    }),
                    autoOpen: false,
                    panelPosition: 'down'
                });

                this.dropdownRegion.show(this.dropdownView);
            },

            __onTimeSelected: function (time) {
                var oldVal = this.model.get('value'),
                    newVal = '';

                if (time === null || time === '') {
                    newVal = null;
                } else if (oldVal) {
                    var momentTime = lib.moment(time);
                    newVal = lib.moment(oldVal).hour(momentTime.hour()).minute(momentTime.minute()).toString();
                } else {
                    newVal = time;
                }

                this.model.set('value', newVal);
                this.dropdownView.close();
            },

            __onPanelOpen: function () {
                if (this.model.get('enabled') && !this.model.get('readonly')) {
                    this.dropdownView.open();
                }
            },

            __onPanelClose: function () {
                this.dropdownView.close();
            }
        });
    });
