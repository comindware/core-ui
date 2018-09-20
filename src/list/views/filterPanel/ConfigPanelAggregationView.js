import template from '../../templates/configPanelAgregation.html';
import FilterEditorsFactory from '../../services/FilterEditorsFactory';

export default Marionette.View.extend({
    initialize() {
        if (this.model.get('columnModel')) {
            this.listenTo(this.model, 'change', () => this.render());
        }
    },

    className: 'dev-aggregation-view',

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    triggers: {
        'js-apply-button': 'trigger:apply'
    },

    template: Handlebars.compile(template),

    onRender() {
        this.getRegion('dropdownRegion').show(this.__createView());
    },

    __createView() {
        return FilterEditorsFactory.getAggregationPredicates(this.model.get('columnType'), this.model.get('columnModel').get('aggregation'));
    }
});
