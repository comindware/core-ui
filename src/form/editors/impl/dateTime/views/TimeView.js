/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment, Handlebars, $ } from 'lib';
import { dateHelpers } from 'utils';
import dropdown from 'dropdown';
import TimeInputView from './TimeInputView';
import template from '../templates/time.hbs';

export default Marionette.LayoutView.extend({
    initialize: function () {
        this.timezoneOffset = this.getOption('timezoneOffset') || 0;
        this.allowEmptyValue = this.getOption('allowEmptyValue');
        this.timeDisplayFormat = this.getOption('timeDisplayFormat');
    },

    className: 'time-view',

    template: Handlebars.compile(template),

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
                model: this.model,
                timezoneOffset: this.timezoneOffset,
                allowEmptyValue: this.allowEmptyValue,
                timeDisplayFormat: this.timeDisplayFormat
            },
            panelView: Marionette.CollectionView.extend({
                collection: new Backbone.Collection(timeArray),
                tagName: 'ul',
                className: 'time-dropdown',
                childEvents: {
                    'select': function (view, time) { this.trigger('select', time); }
                },
                childView: Marionette.ItemView.extend({
                    tagName: 'li',
                    className: 'time-dropdown__i',
                    events: {
                        'click': function () {
                            this.trigger('select', this.model.get('time'));
                        }
                    },
                    template: Handlebars.compile('{{formattedTime}}')
                })
            }),
            renderAfterClose: false,
            autoOpen: false
        });
        this.listenTo(this.dropdownView, 'before:close', this.__onBeforeClose, this);
        this.listenTo(this.dropdownView, 'open', this.__onOpen, this);

        this.listenTo(this.dropdownView, 'button:focus', this.__onButtonFocus, this);
        this.listenTo(this.dropdownView, 'button:calendar:open', this.__onButtonCalendarOpen, this);
        this.listenTo(this.dropdownView, 'panel:select', this.__onPanelSelect, this);

        this.dropdownRegion.show(this.dropdownView);
    },

    __onBeforeClose: function () {
        this.dropdownView.button.endEditing();
        this.trigger('blur');
    },

    __onOpen: function () {
        this.dropdownView.button.startEditing();
        this.trigger('focus');
    },

    __onPanelSelect: function (time) {
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

    __onButtonCalendarOpen: function () {
        this.dropdownView.open();
    },

    __onButtonFocus: function () {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.dropdownView.open();
        }
    },

    focus: function () {
        this.dropdownView.button.focus();
    },

    blur: function () {
        this.dropdownView.close();
    },

    hasFocus: function () {
        return $.contains(this.el, document.activeElement);
    }
});
