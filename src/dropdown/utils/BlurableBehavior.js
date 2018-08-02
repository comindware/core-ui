// @flow
import { helpers } from 'utils';

const defaultOptions = {
    selector: undefined,
    allowNestedFocus: true,
    onBlur: undefined
};

export default Marionette.Behavior.extend({
    initialize(options, view) {
        helpers.ensureOption(options, 'onBlur');

        _.extend(this.options, defaultOptions, _.pick(options || {}, Object.keys(defaultOptions)));

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
        } else if (document.activeElement) {
            document.activeElement.addEventListener('blur', this.__onBlur);
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
        if (document.activeElement) {
            document.activeElement.removeEventListener('blur', this.__onBlur);
        }
    }
});
