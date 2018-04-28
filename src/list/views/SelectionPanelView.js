//@flow
import template from '../templates/selectionPanel.hbs';

import SelectionCellView from './SelectionCellView';

export default Marionette.CompositeView.extend({
    initialize(options) {
        this.gridEventAggregator = options.gridEventAggregator;
        this.listenTo(this.gridEventAggregator, 'update:height', this.__updateHeight);
        this.listenTo(this.gridEventAggregator, 'update:top', this.__updateTop);
    },

    className: 'grid-selection-panel',

    childView: SelectionCellView,

    template: Handlebars.compile(template),

    childViewContainer: '.js-selection-panel-wrp',

    ui: {
        childViewContainer: '.js-selection-panel-wrp'
    },

    _showCollection() {
        const models = this.collection.visibleModels;

        models.forEach((child, index) => {
            this._addChild(child, index);
        });
        this.children._updateLength();
    },

    // override default method to correct add when index === 0 in visible collection
    _onCollectionAdd(child, collection, opts) {
        // `index` is present when adding with `at` since BB 1.2; indexOf fallback for < 1.2
        let index = opts.at !== undefined && (opts.index !== undefined ? opts.index : collection.indexOf(child));


        if (this.filter || index === false) {
            index = _.indexOf(this._filteredSortedModels(index), child);
        }

        if (this._shouldAddChild(child, index)) {
            this._destroyEmptyView();
            this._addChild(child, index);
        }
    },

    onRender() {
        // todo: find way to remove it
        if (this.options.showRowIndex) {
            this.el.classList.add('cell_selection-index');
        }
    },

    __updateHeight(height) {
        this.$el.height(height);
    },

    __updateTop(top) {
        this.ui.childViewContainer.css('top', top);
    }
});
