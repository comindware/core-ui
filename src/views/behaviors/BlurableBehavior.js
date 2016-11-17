/**
 * Developer: Stepan Burguchev
 * Date: 9/7/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { $ } from '../../libApi';
import { helpers } from '../../utils/utilsApi';

let defaultOptions = {
    selector: null,
    allowNestedFocus: true,
    onBlur: null
};

export default Marionette.Behavior.extend({
    initialize (options, view) {
        helpers.ensureOption(options, 'onBlur');

        _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));

        _.bindAll(this, '__onBlur');

        view.focus = this.__focus.bind(this);
    },

    events () {
        let key = 'blur';
        if (this.options.selector) {
            key += ` ${this.options.selector}`;
        }
        return {
            [key]: '__onBlur'
        };
    },

    onRender () {
        this.__getFocusableEl().attr('tabindex', -1);
    },

    __getFocusableEl () {
        if (this.options.selector) {
            return this.$(this.options.selector);
        }
        return this.$el;
    },

    __isActiveElementNestedInto ($focusableEl) {
        return $focusableEl[0] === document.activeElement || $.contains($focusableEl[0], document.activeElement);
    },

    __isActiveElementNestedIntoRoots () {
        let roots = this.options.roots.call(this.view);
        return Boolean(roots.find(r => this.__isActiveElementNestedInto(r)));
    },

    __focus () {
        // If the focused element is nested into our focusable element, we simply bind to it. Otherwise, we focus the focusable element.
        let $focusableEl = this.__getFocusableEl();
        if (!this.__isActiveElementNestedInto($focusableEl) && !this.__isActiveElementNestedIntoRoots()) {
            $focusableEl.focus();
        } else {
            $(document.activeElement).one('blur', this.__onBlur);
        }
    },

    __onBlur () {
        let $focusableEl = this.__getFocusableEl();
        _.defer(function () {
            if (this.__isActiveElementNestedInto($focusableEl) || this.__isActiveElementNestedIntoRoots()) {
                $(document.activeElement).one('blur', this.__onBlur);
            } else {
                // Call the provided onBlur function
                let callback = this.options.onBlur;
                if (_.isString(callback)) {
                    this.view[callback].call(this.view);
                } else {
                    callback.call(this.view);
                }
            }
        }.bind(this));
    }
});
