/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment, Handlebars } from '../../../../../libApi';
import { dateHelpers } from '../../../../../utils/utilsApi';
import dropdown from '../../../../../dropdown/dropdownApi';
import TimeInputView from './TimeInputView';
import template from '../templates/time.hbs';

export default Marionette.LayoutView.extend({
    initialize: function () {
        this.timezoneOffset = this.getOption('timezoneOffset') || 0;
        this.allowEmptyValue = this.getOption('allowEmptyValue');

        this.reqres = new Backbone.Wreqr.RequestResponse();
        this.reqres.setHandler('time:selected', this.__onTimeSelected, this);
        this.reqres.setHandler('panel:open', this.__onPanelOpen, this);
        this.reqres.setHandler('panel:close', this.__onPanelClose, this);
    },

    className: 'time-view',

    template: template,

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    onRender: function () {
        var timeArray = [];

        for (var h = 0; h < 24; h++) {
            for (var m = 0; m < 60; m+=15) {
                var val = {hours: h, minutes: m},
                    time = moment.utc(val),
                    formattedTime = dateHelpers.getDisplayTime(time);

                timeArray.push({
                    time: time,
                    formattedTime: formattedTime
                });
            }
        }

        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: TimeInputView,
            buttonViewOptions: {
                reqres: this.reqres,
                model: this.model,
                timezoneOffset: this.timezoneOffset,
                allowEmptyValue: this.allowEmptyValue
            },
            panelView: Marionette.CollectionView.extend({
                reqres: this.reqres,
                collection: new Backbone.Collection(timeArray),
                tagName: 'ul',
                className: 'time-dropdown',
                childView: Marionette.ItemView.extend({
                    tagName: 'li',
                    className: 'time-dropdown__i',
                    reqres: this.reqres,
                    events: {
                        'click': '__handleClick'
                    },
                    __handleClick: function () {
                        //noinspection JSPotentiallyInvalidUsageOfThis
                        this.reqres.request('time:selected', this.model.get('time'));
                    },
                    template: Handlebars.compile('{{this.formattedTime}}')
                })
            }),
            autoOpen: false,
            panelPosition: 'down'
        });
        this.listenTo(this.dropdownView, 'button:focus', () => this.trigger('focus'));
        this.listenTo(this.dropdownView, 'button:blur', () => this.trigger('blur'));

        this.dropdownRegion.show(this.dropdownView);
    },

    __onTimeSelected: function (time) {
        var oldVal = this.model.get('value'),
            newVal = null;

        if (time === null || time === '') {
            newVal = null;
        } else if (oldVal) {
            newVal = moment.utc(oldVal).utcOffset(this.timezoneOffset).hour(time.hour()).minute(time.minute()).second(0).millisecond(0).toISOString();
        } else {
            time = time.clone();
            newVal = time.minute(time.minute() - this.timezoneOffset).toISOString();
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
    },

    focus: function () {
        this.dropdownView.focus();
    },

    blur: function () {
        this.dropdownView.blur();
    }
});
