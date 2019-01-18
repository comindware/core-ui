// @flow
import { keyCode } from 'utils';
import LocalizationService from '../../../../../services/LocalizationService';
import TextEditorView from '../../../TextEditorView';
import template from '../templates/input.hbs';

const classes = {
    EMPTY: ' empty'
};

export default TextEditorView.extend({
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
        'keyup @ui.input': '__commit',
        'input @ui.input': '__search',
        'focus @ui.input': '__focus',
        'blur @ui.input': '__blur'
    },

    modelEvents: {
        'change:empty': '__updateInputPlaceholder',
        'change:searchText': '__onModelChangeSearch'
    },

    onRender() {
        this.updateInput(this.model.get('searchText'));
        this.__updateInputPlaceholder();
    },

    focus(options) {
        this.ui.input.focus();
        this.__focus(options);
    },

    __focus(options = {}) {
        if (options.isShowLastSearch) {
            this.updateInput(this.filterValue);
        }
    },

    blur() {
        this.ui.input.blur();
        this.__blur();
    },

    __blur() {
    },

    __getFilterValue() {
        return (
            this.__getRawValue()
                .toLowerCase()
                .trim() || ''
        );
    },

    __getRawValue() {
        return this.ui.input.val();
    },

    __onModelChangeSearch(model, searchText) {
        this.updateInput(searchText);
    },

    updateInput(value = '') {
        this.ui.input.val(value);
    },

    __search(e) {
        const value = this.__getFilterValue();
        switch (e.keyCode) {
            case keyCode.BACKSPACE: {
                if (this.__getRawValue().length === 0) {
                    if (!this.options.enabled) {
                        return;
                    }
                    this.reqres.request('input:backspace');
                }
                break;
            }
            case keyCode.UP: {
                this.reqres.request('input:up');
                break;
            }
            case keyCode.DOWN: {
                this.reqres.request('input:down');
                break;
            }
            default: {
                if (this.filterValue === value) {
                    return;
                }
                this.filterValue = value;
                this.reqres.request('input:search', value);
            }
        }
    },

    __commit(e) {
        switch (e.keyCode) {
            case keyCode.ENTER: {
                e.preventDefault && e.preventDefault();
                e.stopImmediatePropagation && e.stopImmediatePropagation();
                this.reqres.request('try:value:select');
                return false;
            }
            default: {
                break;
            }
        }
    },

    __updateInputPlaceholder() {
        const empty = this.model.get('empty');
        const placeholder = empty ? LocalizationService.get('CORE.FORM.EDITORS.BUBBLESELECT.NOTSET') : '';
        this.ui.input.attr({ placeholder }).toggleClass(classes.EMPTY, empty);
    }
});
