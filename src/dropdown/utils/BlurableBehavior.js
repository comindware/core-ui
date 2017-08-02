/**
 * Developer: Stepan Burguchev
 * Date: 9/7/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { helpers } from 'utils';
import { $ } from 'lib';

const defaultOptions = {
    selector: null,
    allowNestedFocus: true,
    onBlur: null
};

export default Marionette.Behavior.extend({
    initialize(options, view) {
        helpers.ensureOption(options, 'onBlur');

        _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));

        _.bindAll(this, '__onBlur');

        view.focus = this.__focus.bind(this);
    },

    events() {
        let key = 'blur';
        if (this.options.selector) {
            key += ` ${this.options.selector}`;
        }
        return {
            [key]: '__onBlur'
        };
    },

    onRender() {
        this.__getFocusableEl().attr('tabindex', -1);
    },

    __getFocusableEl() {
        if (this.options.selector) {
            return this.$(this.options.selector);
        }
        return this.$el;
    },

    __focus(focusedEl) {
        if (!focusedEl) {
            this.__getFocusableEl().focus();
        } else {
            $(document.activeElement).one('blur', this.__onBlur);
        }
        this.view.isFocused = true;
    },

    __onBlur() {
        _.defer(() => {
            this.view.isFocused = false;
            const callback = this.options.onBlur;
            if (_.isString(callback)) {
                this.view[callback].call(this.view);
            } else {
                callback.call(this.view);
            }
        });
    }
});
