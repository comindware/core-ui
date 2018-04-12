/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import template from '../templates/date.hbs';

export default Marionette.LayoutView.extend({
    initialize() {
        this.preserveTime = !!this.getOption('preserveTime'); // If false (default), drop time components on date change
        this.allowEmptyValue = this.getOption('allowEmptyValue');
        this.dateDisplayFormat = this.getOption('dateDisplayFormat');
        this.showTitle = this.getOption('showTitle');
    },

    template: Handlebars.compile(template),

    className: 'date-view',

    regions: {
        popoutRegion: '.js-popout-region'
    },

    ui: {
        initialValue: '.js-date-input'
    },

    events: {
        focus: '__showEditor',
        mousedown: '__showEditor'
    },

    onRender() {
        this.__updateDisplayValue();
    }
});
