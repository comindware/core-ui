import BaseMembersGridView from './BaseMembersGridView';
import _ from 'underscore';

export default BaseMembersGridView.extend({
    initialize(options) {
        this.collection = options.membersCollection || options.model.get('available');
        this.handleSearch = false;
        this.filterFns = options.filterFns;
        const toggleQuantityWarning = _.debounce(() => this.__toggleQuantityWarning(), 300);
        this.listenTo(this.collection, 'reset update filter', toggleQuantityWarning);

        this.__debounceMembersUpdate = _.debounce((...args) => this.__membersUpdate(...args), this.options.textFilterDelay);

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
        this.getRegion('quantityWarningRegion').el.style.display = 'none';
    },

    onAttach() {
        this.listenTo(this.gridView, 'search', text => {
            this.filterState.setSearchString(text);
            this.__debounceMembersUpdate();
        });
    },

    __membersUpdate() {
        this.trigger('members:update', this.filterState);
    },

    __toggleQuantityWarning() {
        if (!this.isDestroyed()) {
            const region = this.getRegion('quantityWarningRegion');
            if (this.model.get('available').length + this.model.get('selected').length < this.collection.totalCount) {
                delete region.el.style.display;
            } else {
                region.el.style.display = 'none';
            }
        }
    }
});
