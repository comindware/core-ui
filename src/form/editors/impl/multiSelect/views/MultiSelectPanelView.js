/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import list from '../../../../../list/listApi';
import template from '../templates/multiSelectPanel.hbs';
import MultiSelectItemView from './MultiSelectItemView';

export default Marionette.CompositeView.extend({
    className: 'multiselect-panel',

    template: Handlebars.compile(template),

    templateHelpers: function() {
        return {
            explicitApply: this.getOption('explicitApply')
        };
    },

    childView: MultiSelectItemView,

    childViewOptions: function() {
        return {
            displayAttribute: this.getOption('displayAttribute')
        };
    },

    childViewContainer: '.js-list',

    ui: {
        selectAll: '.js-select-all',
        apply: '.js-apply',
        cancel: '.js-cancel',
        close: '.js-close'
    },

    events: {
        'click @ui.selectAll': '__selectAll',
        'click @ui.apply': '__apply',
        'click @ui.cancel': '__close',
        'click @ui.close': '__close'
    },

    onShow: function() {
        this.$el.focus();
    },

    initialize: function(options) {
        helpers.ensureOption(options, 'model');
        this.collection = this.model.get('collection');
    },

    __selectAll: function() {
        this.trigger('select:all');
    },

    __apply: function() {
        this.trigger('apply');
    },

    __close: function() {
        this.trigger('close');
    }
});
