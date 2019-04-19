import BaseMembersGridView from './BaseMembersGridView';
import { virtualCollectionFilterActions } from 'Meta';

export default BaseMembersGridView.extend({
    initialize(options) {
        this.collection = options.membersCollection || options.model.get('available');
        this.handleSearch = false;
        this.filterFns = options.filterFns;
        const toggleQuantityWarning = _.debounce(() => this.__toggleQuantityWarning(), 300);
        this.listenTo(this.collection, 'reset update filter', toggleQuantityWarning);

        BaseMembersGridView.prototype.initialize.call(this, options);
        this.gridView.filterState = options.filterState;
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
        this.getRegion('quantityWarningRegion').$el.hide();
    },

    onAttach() {
        if (this.options.model.get('showGroups') && !this.options.model.get('showUsers')) {
            this.collection.filter(this.filterFns[`filterFn_${this.filterFnParameters.users}`], { action: virtualCollectionFilterActions.PUSH });
        }
        if (this.options.model.get('showUsers') && !this.options.model.get('showGroups')) {
            this.collection.filter(this.filterFns[`filterFn_${this.filterFnParameters.groups}`], { action: virtualCollectionFilterActions.PUSH });
        }
        this.listenTo(this.gridView, 'search', text => {
            this.gridView.filterState.setSearchString(text);
            this.reqres.request('members:update', this.gridView.filterState);
        });
    },

    __toggleQuantityWarning() {
        if (this.collection.length < this.collection.totalCount) {
            this.getRegion('quantityWarningRegion').$el.show();
        } else {
            this.getRegion('quantityWarningRegion').$el.hide();
        }
    },

    __handleApplyFilter(gridView, act) {
        this.reqres.request('members:filter:updateState', gridView, act);
    }
});
