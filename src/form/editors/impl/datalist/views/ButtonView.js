// @flow
import template from '../templates/button.hbs';
import BubbleCollection from './BubbleCollectionView';
import LoadingView from './../../reference/views/LoadingView';

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
        },
        loadingRegion: '.js-loading-region'
    },

    events: {
        click: '__click'
    },

    __click() {
        this.reqres.request('button:click');
    },

    onRender(): void {
        this.collectionView = new BubbleCollection(this.options);
        this.showChildView('collectionRegion', this.collectionView);
        this.collectionView.on('add:child remove:child', () => this.trigger('change:content'));
    },

    focus() {
        this.collectionView.focus();
    },

    blur() {
        this.collectionView.blur();
    },

    setLoading(state) {
        if (this.isDestroyed()) {
            return;
        }
        // this.isLoading = state;
        if (state) {
            this.showChildView('loadingRegion', new LoadingView());
        } else {
            this.getRegion('loadingRegion').reset();
        }
    }
});
