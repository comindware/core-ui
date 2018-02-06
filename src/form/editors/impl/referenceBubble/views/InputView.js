
import { keypress } from 'lib';
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
        'keydown @ui.input': '__search',
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
            this.reqres.request('try:value:select');
        }
    },

    __getFilterValue() {
        return this.ui.input.val().toLowerCase().trim() || '';
    },

    updateInput(value = '') {
        this.ui.input.val(value);
    },

    __search(e) {
        const value = this.__getFilterValue();

        if (e.keyCode === 8) {
            if (value.length === 0) {
                if (!this.options.enabled) {
                    return;
                }
                this.reqres.request('bubble:delete:last');
            }
        } else {
            if (this.filterValue === value) {
                return;
            }
            this.filterValue = value;
            this.reqres.request('input:search', value, false);
        }
    },

    __updateInputPlaceholder() {
        const empty = this.model.get('empty');
        const placeholder = empty ? LocalizationService.get('CORE.FORM.EDITORS.BUBBLESELECT.NOTSET') : '';
        this.ui.input.attr({ placeholder }).toggleClass(classes.EMPTY, empty);
    }
});
