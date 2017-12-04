
import template from './templates/headerItem.hbs';
import StepperItemView from './StepperItemView';

export default Marionette.CollectionView.extend({
    className: 'layout__tab-layout__header-view-item',

    template: Handlebars.compile(template),

    childView: StepperItemView,

    childEvents: {
        'step:selected': '__handleStepSelect'
    },

    __handleStepSelect(view) {
        if (view.model.get('enabled')) {
            this.trigger('stepper:item:selected', view.model);
        }
    }
});
