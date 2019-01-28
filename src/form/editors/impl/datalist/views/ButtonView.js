// @flow
import template from '../templates/button.hbs';
import BubbleCollectionView from './BubbleCollectionView';

const classes = {
    CLASS_NAME: 'bubbles',
    DISABLED: ' disabled'
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
    },

    template: Handlebars.compile(template),

    className() {
        return classes.CLASS_NAME + (this.options.enabled ? '' : classes.DISABLED);
    },

    regions: {
        collectionRegion: {
            el: '.js-collection-region',
            replaceElement: true
        }
    },

    ui: {
        loading: '.js-datalist-loading'
    },

    events: {
        click: '__click'
    },

    __click() {
        this.reqres.request('button:click');
    },

    onRender(): void {
        this.collectionView = new BubbleCollectionView(this.options);
        this.showChildView('collectionRegion', this.collectionView);
    },

    focus(options) {
        this.collectionView.focus(options);
    },

    blur() {
        this.collectionView.blur();
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
    }
});
