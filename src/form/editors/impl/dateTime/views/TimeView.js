/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

import { moment, Handlebars, $ } from 'lib';
import { dateHelpers } from 'utils';
import dropdown from 'dropdown';
import TimeInputView from './TimeInputView';
import template from '../templates/time.hbs';

export default Marionette.LayoutView.extend({
    initialize() {
        this.allowEmptyValue = this.getOption('allowEmptyValue');
        this.timeDisplayFormat = this.getOption('timeDisplayFormat');
        this.showTitle = this.getOption('showTitle');

        this.dropdownView = this.__getDropdownView();

        this.listenTo(this.dropdownView, 'before:close', this.__onBeforeClose, this);
        this.listenTo(this.dropdownView, 'open', this.__onOpen, this);

        this.listenTo(this.dropdownView, 'button:focus', this.__onButtonFocus, this);
        this.listenTo(this.dropdownView, 'button:calendar:open', this.__onButtonCalendarOpen, this);
        this.listenTo(this.dropdownView, 'panel:select', this.__onPanelSelect, this);
    },

    className: 'time-view',

    template: Handlebars.compile(template),

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    onRender() {
        this.dropdownRegion.show(this.dropdownView);
    },

    __getDropdownView() {
        const timeArray = [];

        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const val = { hours: h, minutes: m };
                const time = moment.utc(val);
                const formattedTime = dateHelpers.getDisplayTime(time);

                timeArray.push({
                    time,
                    formattedTime
                });
            }
        }

        return dropdown.factory.createDropdown({
            buttonView: TimeInputView,
            buttonViewOptions: {
                model: this.model,
                allowEmptyValue: this.allowEmptyValue,
                timeDisplayFormat: this.timeDisplayFormat,
                showTitle: this.showTitle
            },
            panelView: Marionette.CollectionView.extend({
                collection: new Backbone.Collection(timeArray),
                tagName: 'ul',
                className: 'time-dropdown',
                childEvents: {
                    select(view, time) { this.trigger('select', time); }
                },
                childView: Marionette.ItemView.extend({
                    tagName: 'li',
                    className: 'time-dropdown__i',
                    events: {
                        click() {
                            this.trigger('select', this.model.get('time'));
                        }
                    },
                    template: Handlebars.compile('{{formattedTime}}')
                })
            }),
            renderAfterClose: false,
            autoOpen: false
        });
    },

    __onBeforeClose() {
        if (this.dropdownView.isDestroyed) {
            return;
        }
        this.dropdownView.button.endEditing();
        this.trigger('blur');
    },

    __onOpen() {
        this.dropdownView.button.startEditing();
        this.trigger('focus');
    },

    __onPanelSelect(time) {
        const oldVal = this.model.get('value');
        let newVal = null;

        if (time === null || time === '') {
            newVal = null;
        } else if (oldVal) {
            newVal = moment(oldVal).hour(time.hour())
                .minute(time.minute())
                .second(0)
                .millisecond(0)
                .toISOString();
        } else {
            newVal = time.clone().minute(time.clone().minute()).toISOString();
        }

        this.model.set('value', newVal);

        this.dropdownView.close();
    },

    __onButtonCalendarOpen() {
        this.dropdownView.open();
    },

    __onButtonFocus() {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.dropdownView.open();
        }
    },

    focus() {
        this.dropdownView.button.focus();
    },

    blur() {
        this.dropdownView.close();
    },

    hasFocus() {
        return $.contains(this.el, document.activeElement);
    }
});
