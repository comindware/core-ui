import template from '../../templates/filterPanel/configPanelFilter.html';
import FilterItemView from './FilterItemView';
import { columnType } from '../../meta';

export default Marionette.CollectionView.extend({
    initialize() {
        if (this.model.get('columnModel') && !this.model.get('columnModel').has('filters')) {
            this.listenTo(this.model, 'change', this.__updateCollection);
        }

        this.__updateCollection();
    },

    templateContext() {
        return {
            showAddButton: this.model.get('columnType') !== columnType.boolean
        };
    },

    template: Handlebars.compile(template),

    childView: FilterItemView,

    childViewEvents: {
        'click:removeButton': '__onClickRemoveButton',
        attach: '__updateAddFilterButton',
        change: '__updateAddFilterButton'
    },

    childViewContainer: '.js-config-panel-filter',

    triggers: {
        'click .js-apply-button': 'apply:filter',
        'click .js-add-filter-button': 'add:filter'
    },

    childViewOptions() {
        return {
            filtersConfigurationModel: this.model.get('filtersConfigurationModel')
        };
    },

    ui: {
        addFilterButton: '.js-add-filter-button'
    },

    __updateAddFilterButton() {
        this.ui.addFilterButton.toggle(!this.children.some(child => child.isEmptyValue && child.isEmptyValue()));
    },

    validate() {
        const errors = this.children.reduce((res, child) => {
            const childErrors = child.validate();
            if (childErrors.length) {
                res.push(...childErrors);
            }
            return res;
        }, []);

        return errors.length;
    },

    __updateCollection() {
        this.collection = this.model.get('columnModel').get('filters');
        this.render();
    },

    __onClickRemoveButton(view) {
        this.model
            .get('columnModel')
            .get('filters')
            .remove(view.model);
        this.render();
    }
});
