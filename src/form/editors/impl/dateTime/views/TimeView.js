/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

import { dateHelpers } from 'utils';
import dropdown from 'dropdown';
import TimeInputView from './TimeInputView';
import template from '../templates/time.hbs';
import DateTimeService from '../../../services/DateTimeService';

export default Marionette.LayoutView.extend({
    initialize() {
        this.allowEmptyValue = this.getOption('allowEmptyValue');
        this.timeDisplayFormat = this.getOption('timeDisplayFormat');
        this.showTitle = this.getOption('showTitle');
    },

    events: {

    },

    modelEvents: {
        'change:value': '__updateDisplayValue',
    },

    ui: {
        initialValue: '.js-time-input'
    },

    onRender() {
        this.__updateDisplayValue();
    },

    __updateDisplayValue() {
        if (this.isDropdownShown) {
            return;
        }
        this.ui.initialValue.val(DateTimeService.getTimeDisplayValue(this.model.get('value'), this.options.timeDisplayFormat));
    },


});
