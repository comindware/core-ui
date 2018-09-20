import template from '../../templates/configPanelFilter.html';
import FilterItemView from './FilterItemView';
import EmptyFilterItemView from './EmptyFilterItemView';

export default Marionette.CompositeView.extend({
    initialize() {
        if (this.model.get('columnModel') && !this.model.get('columnModel').has('filters')) {
            this.listenTo(this.model, 'change', this.__updateCollection);
        }

        this.__updateCollection();
    },

    childView: FilterItemView,

    emptyView: EmptyFilterItemView,

    childViewEvents: {
        'click:removeButton': '__onClickRemoveButton'
    },

    triggers: {
        'js-apply-button': 'trigger:apply'
    },

    childViewOptions() {
        return {
            filtersConfigurationModel: this.model.get('filtersConfigurationModel')
        };
    },

    template: Handlebars.compile(template),

    __updateCollection() {
        this.collection = this.model.get('columnModel').get('filters');
        this.render();
    },

    __onClickRemoveButton(view) {
        this.model.get('columnModel').get('filters').remove(view.model);
        this.render();
    }
});
