// @flow
import LocalizationService from '../../../../../services/LocalizationService';
import template from '../templates/input.hbs';

const classes = {
    EMPTY: ' empty'
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.parent = options.parent;

        this.fetchDelayId = _.uniqueId('fetch-delay-id-');

        this.filterValue = '';
    },

    template: Handlebars.compile(template),

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
    },

    focus() {
        this.ui.input.focus();
    },

    blur() {
        this.ui.input.blur();
    },

    __getFilterValue() {
        return (
            this.ui.input
                .val()
                .toLowerCase()
                .trim() || ''
        );
    },

    updateInput(value = '') {
        this.ui.input.val(value);
    },

    __search(e) {
        const value = this.__getFilterValue();
        switch (e.keyCode) {
            case 8: {
                if (value.length === 0) {
                    if (!this.options.enabled) {
                        return;
                    }
                    this.reqres.request('bubble:delete:last');
                }
                break;
            }
            case 13: {
                this.reqres.request('try:value:select');
                break;
            }
            case 38: {
                this.reqres.request('input:up');
                break;
            }
            case 40: {
                this.reqres.request('input:down');
                break;
            }
            default: {
                if (this.filterValue === value) {
                    return;
                }
                this.filterValue = value;
                this.reqres.request('input:search', value, false);
            }
        }
    },

    __updateInputPlaceholder() {
        const empty = this.model.get('empty');
        const placeholder = empty ? LocalizationService.get('CORE.FORM.EDITORS.BUBBLESELECT.NOTSET') : '';
        this.ui.input.attr({ placeholder }).toggleClass(classes.EMPTY, empty);
    }
});
