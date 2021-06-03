import template from '../../templates/filterPanel/filterItem.html';
import { columnType, enabledFilterEditor } from '../../meta';
import FilterValueItemView from './FilterValueItemView';
import FilterEditorsFactory from '../../services/FilterEditorsFactory';

export default Marionette.View.extend({
    initialize(options) {
        this.__createFilterCompositeView(options.filtersConfigurationModel.get('columnType'));
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
        this.listenTo(this.filterView, 'change', () => this.trigger('change'));
        this.listenTo(this.filterView, 'keyup:editor', this.__applyFilterChange);
        if (this.filterPredicateDropdown) {
            this.showChildView('predicateDropdownRegion', this.filterPredicateDropdown);
            this.listenTo(this.filterPredicateDropdown, 'change', this.__applyFilterPredicateChange);
        }
        this.__adjustRemoveFilterButtonVisibility();
        this.__applyEditorVisibility(this.model.get('operator'));
    },

    isEmptyValue() {
        return this.filterView.children.some(child => child.editor.isEmptyValue());
    },

    validate() {
        return this.filterView.children.reduce((res, child) => {
            const error = child.validate && child.validate();
            if (error) {
                res.push(error);
            }
            return res;
        }, []);
    },

    __createFilterView() {
        return new FilterValueItemView({
            filtersConfigurationModel: this.getOption('filtersConfigurationModel'),
            collection: this.model.get('values'),
            parentModel: this.model
        });
    },

    __createFilterPredicateDropdown(predicateColumnType, model) {
        return FilterEditorsFactory.getFilterPredicates(predicateColumnType, model);
    },

    __createFilterCompositeView(filterType) {
        switch (filterType) {
            case columnType.string:
            case columnType.integer:
            case columnType.decimal:
            case columnType.datetime:
            case columnType.duration:
            case columnType.users:
            case columnType.reference:
            case columnType.role:    
                this.filterView = this.__createFilterView();
                this.filterPredicateDropdown = this.__createFilterPredicateDropdown(this.getOption('filtersConfigurationModel').get('columnType'), this.model);
                this.el.classList.remove('filters_settings-inline-after');
                break;
            case columnType.id:
            case columnType.enumerable:
            case columnType.boolean:
            case columnType.document:
                this.filterView = this.__createFilterView();
                this.el.classList.add('filters_settings-inline-after');
                break;
            default:
                throw new Error(`Unknown filter type ${filterType}`);
        }
    },

    __applyFilterPredicateChange() {
        this.__applyEditorVisibility();
    },

    __applyFilterChange() {
        this.trigger('apply:editorChanges', this.model);
    },

    __adjustRemoveFilterButtonVisibility() {
        switch (this.getOption('filtersConfigurationModel').get('columnType')) {
            case columnType.enumerable:
            case columnType.users:
            case columnType.document:
            case columnType.boolean:
                this.ui.removeButton.hide();
                break;
            default:
                this.ui.removeButton.show();
        }
    },

    __applyEditorVisibility() {
        const region = this.getRegion('filterRegion');
        if (enabledFilterEditor(this.model)) {
            delete region.el.style.display;
        } else {
            region.el.style.display = 'none';
        }
    }
});
