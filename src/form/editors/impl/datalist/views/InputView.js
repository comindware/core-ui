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
        'keydown @ui.input': '__keydown',
        'input @ui.input': '__input',
        'keyup @ui.input': '__commit'
    },

    modelEvents: {
        'change:empty': '__updateInputPlaceholder',
        'change:searchText': '__onModelChangeSearch'
    },

    onRender() {
        this.updateInput(this.model.get('searchText'));
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

    __keydown(e) {
        this.reqres.request('input:keydown', e);
    },

    __input() {
        const value = this.__getFilterValue();
        if (this.filterValue === value) {
            return;
        }
        this.filterValue = value;
        this.reqres.request('input:search', value);
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
