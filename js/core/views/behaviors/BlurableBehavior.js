/**
 * Developer: Stepan Burguchev
 * Date: 9/7/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';
import { helpers } from '../../utils/utilsApi';

let defaultOptions = {
    selector: null,
    allowNestedFocus: true,
    onBlur: null
};

export default Marionette.Behavior.extend({
    initialize: function (options, view) {
        helpers.ensureOption(options, 'onBlur');

        _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));

        _.bindAll(this, '__onBlur');

        view.focus = this.__focus.bind(this);
    },

    events: function () {
        var key = 'blur';
        if (this.options.selector) {
            key += ' ' + this.options.selector;
        }
        return {
            [key]: '__onBlur'
        };
    },

    onRender: function () {
        this.__getFocusableEl().attr('tabindex', -1);
    },

    __getFocusableEl: function () {
        if (this.options.selector) {
            return this.$(this.options.selector);
        } else {
            return this.$el;
        }
    },

    __focus: function () {
        // If the focused element is nested into our focusable element, we simply bind to it. Otherwise, we focus the focusable element.
        var $focusableEl = this.__getFocusableEl();
        let activeElementIsNested = $focusableEl[0] === document.activeElement || $.contains($focusableEl[0], document.activeElement);
        if (!activeElementIsNested) {
            $focusableEl.focus();
        } else {
            $(document.activeElement).one('blur', this.__onBlur);
        }
    },

    __onBlur: function () {
        var $focusableEl = this.__getFocusableEl();
        _.defer(function () {
            let activeElementIsNested = $focusableEl[0] === document.activeElement || $.contains($focusableEl[0], document.activeElement);
            if (activeElementIsNested) {
                $(document.activeElement).one('blur', this.__onBlur);
            } else {
                // Call the provided onBlur function
                var callback = this.options.onBlur;
                if (_.isString(callback)) {
                    this.view[callback].call(this.view);
                } else {
                    callback.call(this.view);
                }
            }
        }.bind(this));
    }
});
