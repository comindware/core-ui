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

    modelEvents: {},

    events: function () {
        var eventsMap = {};
        var key = 'blur';
        if (this.options.selector) {
            key += ' ' + this.options.selector;
        }
        eventsMap[key] = '__onBlur';
        return eventsMap;
    },

    onRender: function () {
        this.__getFocusableEl().attr('tabindex', 0);
    },

    __getFocusableEl: function () {
        if (this.options.selector) {
            return this.$(this.options.selector);
        } else {
            return this.$el;
        }
    },

    __focus: function () {
        this.__getFocusableEl().focus();
    },

    __onBlur: function () {
        var $focusableEl = this.__getFocusableEl();
        _.defer(function () {
            if ($focusableEl[0] === document.activeElement || $focusableEl.find(document.activeElement).length > 0) {
                $(document.activeElement).one('blur', this.__onBlur);
            } else {
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
