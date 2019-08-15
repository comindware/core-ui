import template from '../../templates/filterPanel/configPanelAgregation.html';
import FilterEditorsFactory from '../../services/FilterEditorsFactory';

export default Marionette.View.extend({
    //todo make it functional component
    initialize() {
        if (this.model.get('columnModel')) {
            this.listenTo(this.model, 'change', () => this.render());
        }
    },

    className: 'dev-aggregation-view',

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    template: Handlebars.compile(template),

    onRender() {
        this.getRegion('dropdownRegion').show(this.__createView());
    },

    __createView() {
        return FilterEditorsFactory.getAggregationPredicates(this.model.get('columnType'), this.model.get('columnModel').get('aggregation'));
    }
});
