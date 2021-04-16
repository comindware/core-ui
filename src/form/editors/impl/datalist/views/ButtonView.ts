import template from '../templates/button.hbs';
import TextEditorView from '../../../TextEditorView';
import BubbleCollectionView from './BubbleCollectionView';
import iconWrapRemove from '../../../../editors/iconsWraps/iconWrapRemove.html';
import iconWrapText from '../../../../editors/iconsWraps/iconWrapText.html';

export default TextEditorView.extend({
    initialize(options) {
        TextEditorView.prototype.initialize.call(this, options);
        if (!this.options.isAutocompleteMode) {
            this.collectionView = new BubbleCollectionView(this.options);
        }
        this.listenTo(this, 'input:text:change', value => this.setInputValue(value));
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

    templateContext() {
        return {
            isAutocompleteMode: this.options.isAutocompleteMode
        };
    },

    ui: {
        input: '.js-input',
        loading: '.js-datalist-loading',
        clearButton: '.js-clear-button',
        counterHidden: '.js-counter-hidden'
    },

    triggers: {
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

    events() {
        if (this.options.isAutocompleteMode) {
            const events = {
                'keyup @ui.input': '__keyup',
                'change @ui.input': '__change',
                'click @ui.clearButton': '__onClearClickHandler'
            };
            if (!this.options.hideClearButton) {
                events.mouseenter = '__onMouseenter';
            }
            return events;
        }
        return {};
    },

    onRender(): void {
        if (!this.options.isAutocompleteMode) {
            this.showChildView('collectionRegion', this.collectionView);
        } else {
            TextEditorView.prototype.onRender.apply(this);
        }
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
            this.ui.loading[0]?.removeAttribute('hidden');
        } else {
            this.ui.loading[0]?.setAttribute('hidden', '');
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
    },

    __onClearClickHandler() { 
        this.ui.input.val('');
        this.trigger('input:change', '');
    },

    __change() {
        if (!this.options.isAutocompleteMode) {
            return;
        }
        this.trigger('input:change', this.ui.input.val());
    },

    __keyup() {
        this.trigger('input:keyup', this);
    }
});
