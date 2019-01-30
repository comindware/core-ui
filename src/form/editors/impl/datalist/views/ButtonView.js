// @flow
import template from '../templates/button.hbs';
import TextEditorView from '../../../TextEditorView';
import BubbleCollectionView from './BubbleCollectionView';

export default TextEditorView.extend({
    initialize(options) {
        TextEditorView.prototype.initialize.call(this, options);
        this.collectionView = new BubbleCollectionView(this.options);
        this.reqres = options.reqres;
    },

    template: Handlebars.compile(template),

    className: 'bubbles',

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
        'input @ui.input': '__input'
    },

    __click() {
        this.reqres.request('button:click');
    },

    __keydown(e) {
        this.reqres.request('input:keydown', e);
    },

    __input(e) {
        this.reqres.request('input:search', this.getInputValue());
    },

    onRender(): void {
        this.showChildView('collectionRegion', this.collectionView);
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

    getInputValue() {
        return this.ui.input.val && this.ui.input.val();
    },

    setInputValue(value) {
        return this.ui.input.val && this.ui.input.val(value);
    },

    togglePlaceholder(isShow) {
        this.__setPlaceholder(
            isShow ?
            this.__placeholderShouldBe() :
            ''
        );
    }
});
