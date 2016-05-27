/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import template from '../templates/date.hbs';
import dropdownApi from '../../../../../dropdown/dropdownApi';
import PanelView from './DatePanelView';
import InputView from './DateInputView';

export default Marionette.LayoutView.extend({
    initialize: function () {
        this.timezoneOffset = this.getOption('timezoneOffset') || 0;
        this.preserveTime = !!this.getOption('preserveTime'); // If false (default), drop time components on date change
        this.allowEmptyValue = this.getOption('allowEmptyValue');
    },

    template: template,

    className: 'date-view',

    regions: {
        popoutRegion: '.js-popout-region'
    },

    onShow: function () {
        this.pickerPopout = dropdownApi.factory.createDropdown({
            buttonView: InputView,
            buttonViewOptions: {
                model: this.model,
                timezoneOffset: this.timezoneOffset,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.allowEmptyValue
            },
            panelView: PanelView,
            panelViewOptions: {
                model: this.model,
                timezoneOffset: this.timezoneOffset,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.allowEmptyValue
            },
            autoOpen: false,
            panelPosition: 'down'
        });
        this.listenTo(this.pickerPopout, 'button:open', this.__open, this);
        this.listenTo(this.pickerPopout, 'button:close panel:close', this.__close, this);
        this.listenTo(this.pickerPopout, 'button:focus', () => this.trigger('focus'));
        this.listenTo(this.pickerPopout, 'button:blur', () => this.trigger('blur'));

        this.popoutRegion.show(this.pickerPopout);
    },

    __close: function () {
        this.pickerPopout.close();
    },

    __open: function () {
        this.pickerPopout.open();
    },

    focus: function () {
        this.pickerPopout.focus();
    },

    blur: function () {
        this.pickerPopout.blur();
    }
});
