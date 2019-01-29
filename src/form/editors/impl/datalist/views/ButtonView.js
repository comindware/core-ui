// @flow
import template from '../templates/button.hbs';
import TextEditorView from '../../../TextEditorView';
import BubbleCollectionView from './BubbleCollectionView';
import { keyCode } from 'utils';

const classes = {
    CLASS_NAME: 'bubbles',
    DISABLED: ' disabled'
};

export default TextEditorView.extend({
    initialize(options) {
        TextEditorView.prototype.initialize.call(this, options);
        this.collectionView = new BubbleCollectionView(this.options);
        this.reqres = options.reqres;
        this.filterValue = '';
    },

    template: Handlebars.compile(template),

    className() {
        return classes.CLASS_NAME + (this.options.enabled ? '' : classes.DISABLED);
    },

    regions: {
        collectionRegion: '.js-collection-region'
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        loading: '.js-datalist-loading'
    },

    events: {
        click: '__click',
        'keydown @ui.input': '__keydown',
        'input @ui.input': '__input',
        'keyup @ui.input': '__commit'
    },

    modelEvents: {
        'change:searchText': '__onModelChangeSearch'
    },

    __click() {
        this.reqres.request('button:click');
    },

    onRender(): void {
        this.showChildView('collectionRegion', this.collectionView);

        this.updateInput(this.model.get('searchText'));
    },

    setPermissions(enabled, readonly) {
        TextEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.options.enabled = enabled;
        this.options.readonly = readonly;
    },

    setLoading(state) {
        if (this.isDestroyed()) {
            return;
        }
        if (state) {
            this.ui.loading[0].removeAttribute('hidden');
        } else {
            this.ui.loading[0].setAttribute('hidden', '');
        }
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

    togglePlaceholder(isShow) {
        this.__setPlaceholder(
            isShow ?
            this.__placeholderShouldBe() :
            ''
        );
    }
});
