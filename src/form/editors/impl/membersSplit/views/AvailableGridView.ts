import BaseMembersGridView from './BaseMembersGridView';
import _ from 'underscore';

export default BaseMembersGridView.extend({
    initialize(options) {
        this.collection = options.membersCollection || options.model.get('available');
        this.handleSearch = false;
        this.filterFns = options.filterFns;
        const toggleQuantityWarning = _.debounce(() => this.__toggleQuantityWarning(), 300);
        this.listenTo(this.collection, 'reset update filter', toggleQuantityWarning);

        BaseMembersGridView.prototype.initialize.call(this, options);
        this.filterState = options.filterState;
    },

    className: 'member-split-grid available-members',

    regions() {
        return Object.assign(BaseMembersGridView.prototype.regions, {
            quantityWarningRegion: '.js-quantity-warning-region'
        });
    },

    onRender() {
        BaseMembersGridView.prototype.onRender.apply(this);
        this.showChildView('quantityWarningRegion', this.quantityWarningView);
        this.getRegion('quantityWarningRegion').el.setAttribute('hidden', true);
    },

    onAttach() {
        this.listenTo(this.gridView, 'search', text => {
            this.filterState.setSearchString(text);
            this.trigger('members:update', this.filterState);
        });
    },

    __toggleQuantityWarning() {
        if (!this.isDestroyed()) {
            if (this.collection.length < this.collection.totalCount) {
                this.getRegion('quantityWarningRegion').el.removeAttribute('hidden')();
            } else {
                this.getRegion('quantityWarningRegion').el.setAttribute('hidden', true);
            }
        }
    }
});
