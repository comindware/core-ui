/**
 * Developer: Stepan Burguchev
 * Date: 1/15/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import BlurableBehavior from './BlurableBehavior';
import WindowService from '../../services/WindowService';

var defaultOptions = {
    selector: null,
    allowNestedFocus: true,
    onBlur: null
};

export default Marionette.Behavior.extend({
    initialize: function (options, view) {
        _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));

        view.close = this.close.bind(this);
    },

    behaviors: {
        BlurableBehavior: {
            behaviorClass: BlurableBehavior,
            onBlur: 'close'
        }
    },

    onRender: function () {
        this.__getFocusableEl().addClass('l-popup');
    },

    onShow: function () {
        this.__getFocusableEl().focus();
    },

    __getFocusableEl: function () {
        if (this.options.selector) {
            return this.$(this.options.selector);
        } else {
            return this.$el;
        }
    },

    close: function (result) {
        if (result) {
            this.view.trigger('accept', result);
        } else {
            this.view.trigger('reject');
        }
        this.view.trigger('close');
        WindowService.closePopup();
    }
});
