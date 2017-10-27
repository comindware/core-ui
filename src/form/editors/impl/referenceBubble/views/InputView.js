/**
 * Developer: Ksenia Kartvelishvili
 * Date: 08.30.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars, keypress } from 'lib';
import LocalizationService from '../../../../../services/LocalizationService';
import template from '../templates/input.hbs';

const classes = {
    EMPTY: ' empty'
};

export default Marionette.ItemView.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.parent = options.parent;

        this.fetchDelayId = _.uniqueId('fetch-delay-id-');

        this.filterValue = '';
    },

    template: Handlebars.compile(template),

    tagName: 'li',

    className: 'bubbles__form',

    ui: {
        input: '.js-input'
    },

    focusElement: '.js-input',

    events: {
        'keyup @ui.input': '__search',
        'input @ui.input': '__search'
    },

    modelEvents: {
        'change:empty': '__updateInputPlaceholder'
    },

    onRender() {
        this.updateInput();
        this.__updateInputPlaceholder();
        this.__assignKeyboardShortcuts();
    },

    focus() {
        this.ui.input.focus();
    },

    __assignKeyboardShortcuts() {
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.ui.input[0]);
        _.each(this.keyboardShortcuts, (value, key) => {
            const keys = key.split(',');
            _.each(keys, k => {
                this.keyListener.simple_combo(k, value.bind(this));
            }, this);
        });
    },

    keyboardShortcuts: {
        up() {
            this.reqres.request('input:up');
        },
        down() {
            this.reqres.request('input:down');
        },
        'enter,num_enter'() {
            this.reqres.request('value:select');
        },
        backspace() {
            const value = this.__getFilterValue();
            if (value.length === 0) {
                if (!this.options.enabled) {
                    return;
                }
                this.reqres.request('bubble:delete:last');
            } else {
                this.updateInput(value.slice(0, value.length - 1));
            }
        }
    },

    __getFilterValue() {
        return this.ui.input.val().toLowerCase().trim() || '';
    },

    updateInput(value = '') {
        this.ui.input.val(value);
        this.__updateInputWidth(this.__calculateDesiredInputWidth(value));
    },

    __search() {
        const value = this.__getFilterValue();
        if (this.filterValue === value) {
            return;
        }
        this.__updateInputWidth(this.__calculateDesiredInputWidth(value || this.ui.input.attr('placeholder')));
        this.filterValue = value;
        this.reqres.request('input:search', value, false);
    },

    __calculateDesiredInputWidth(value) {
        let styleBlock = 'position:absolute; left: -1000px; top: -1000px; display:none;';
        const div = $('<div />', {
            style: styleBlock
        });
        let width = div.width() + 25;
        const parentWidth = this.parent.outerWidth();
        const styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
        let style;
        let i;

        for (i = 0; i < styles.length; i++) {
            style = styles[i];
            styleBlock += `${style}:${this.ui.input.css(style)};`;
        }
        div.text(value);
        $('body').append(div);
        div.remove();
        if (parentWidth !== 0 && (width > parentWidth - 10)) {
            width = parentWidth - 10;
        }
        return width;
    },

    __updateInputWidth(width) {
        this.ui.input.css({ width: `${width}px` });
    },

    __updateInputPlaceholder() {
        const empty = this.model.get('empty');
        const placeholder = empty ? LocalizationService.get('CORE.FORM.EDITORS.BUBBLESELECT.NOTSET') : '';
        this.__updateInputWidth(this.__calculateDesiredInputWidth(placeholder));
        this.ui.input.attr({ placeholder }).toggleClass(classes.EMPTY, empty);
    }
});
