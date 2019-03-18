import template from '../../templates/filterPanel/filterItem.html';
import { columnTypes, filterPredicates } from '../../meta';
import FilterValueItemView from './FilterValueItemView';
import FilterEditorsFactory from '../../services/FilterEditorsFactory';

export default Marionette.View.extend({
    initialize(options) {
        this.__createFilterCompositeView(options.filtersConfigurationModel.get('columnTypes'));
    },

    regions: {
        filterRegion: '.js-filter-region',
        predicateDropdownRegion: '.js-predicate-dropdown-region'
    },

    ui: {
        removeButton: '.js-remove-button'
    },

    triggers: {
        'pointerdown @ui.removeButton': 'click:removeButton'
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            isPredicateDropdownExist: !!this.filterPredicateDropdown
        };
    },

    className: 'dataset-options-filters',

    onRender() {
        this.showChildView('filterRegion', this.filterView);
        this.listenTo(this.filterView, 'keyup:editor', this.__applyFilterChange);
        if (this.filterPredicateDropdown) {
            this.showChildView('predicateDropdownRegion', this.filterPredicateDropdown);
            this.listenTo(this.filterPredicateDropdown, 'change', this.__applyFilterPredicateChange);
        }
        this.__adjustRemoveFilterButtonVisibility();
        this.__applyEditorVisibility(this.model.get('operator'));
    },

    __createFilterView() {
        return new FilterValueItemView({
            filtersConfigurationModel: this.getOption('filtersConfigurationModel'),
            collection: this.model.get('values')
        });
    },

    __createFilterPredicateDropdown(predicateColumnType, model) {
        return FilterEditorsFactory.getFilterPredicates(predicateColumnType, model);
    },

    __createFilterCompositeView(filterType) {
        switch (filterType) {
            case columnTypes.string:
            case columnTypes.integer:
            case columnTypes.decimal:
            case columnTypes.datetime:
            case columnTypes.duration:
            case columnTypes.users:
            case columnTypes.reference:
                this.filterView = this.__createFilterView();
                this.filterPredicateDropdown = this.__createFilterPredicateDropdown(this.getOption('filtersConfigurationModel').get('columnType'), this.model);
                this.$el.removeClass('filters_settings-inline-after');
                break;
            case columnTypes.id:
            case columnTypes.enumerable:
            case columnTypes.boolean:
            case columnTypes.document:
                this.filterView = this.__createFilterView();
                this.$el.addClass('filters_settings-inline-after');
                break;
            default:
                throw new Error(`Unknown filter type ${filterType}`);
        }
    },

    __applyFilterPredicateChange() {
        this.__applyEditorVisibility(this.model.get('operator'));
    },

    __applyFilterChange() {
        this.trigger('apply:editorChanges', this.model);
    },

    __adjustRemoveFilterButtonVisibility() {
        switch (this.getOption('filtersConfigurationModel').get('columnType')) {
            case columnTypes.enumerable:
            case columnTypes.users:
            case columnTypes.document:
                this.ui.removeButton.hide();
                break;
            default:
                this.ui.removeButton.show();
        }
    },

    __applyEditorVisibility(operator) {
        const filterRegionEl = this.getRegion('filterRegion').$el;

        if (operator === filterPredicates.set || operator === filterPredicates.notSet) {
            filterRegionEl.hide();
        } else {
            filterRegionEl.show();
        }
    }
});
