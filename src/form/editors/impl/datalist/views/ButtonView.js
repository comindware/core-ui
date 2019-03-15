// @flow
import template from '../templates/button.hbs';
import TextEditorView from '../../../TextEditorView';
import BubbleCollectionView from './BubbleCollectionView';

export default TextEditorView.extend({
    initialize(options) {
        TextEditorView.prototype.initialize.call(this, options);
        this.collectionView = new BubbleCollectionView(this.options);
    },

    template: Handlebars.compile(template),

    className: 'bubbles',

    regions: {
        collectionRegion: {
            el: '.js-collection-region',
            replaceElement: true
        }
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        loading: '.js-datalist-loading',
        counterHidden: '.js-counter-hidden'
    },

    triggers: {
        click: {
            event: 'click',
            preventDefault: false,
            stopPropagation: false
        },
        'keydown @ui.input': {
            event: 'input:keydown',
            preventDefault: false,
            stopPropagation: false
        },
        'input @ui.input': {
            event: 'input:search',
            preventDefault: false,
            stopPropagation: false
        }
    },

    events: false,

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

    setCounter(count) {
        this.ui.counterHidden.text && this.ui.counterHidden.text(count ? `+${count}` : '');
    }
});
