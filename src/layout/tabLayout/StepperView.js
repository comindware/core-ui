// @flow
import template from './templates/headerItem.hbs';
import StepperView from './StepperItemView';

export default Marionette.CollectionView.extend({
    className: 'layout__tab-layout__stepper_container',

    template: Handlebars.compile(template),

    childView: StepperView,

    childViewEvents: {
        'step:selected': '__handleStepSelect'
    },

    __handleStepSelect(model) {
        if (model.get('enabled')) {
            this.trigger('stepper:item:selected', model);
        }
    }
});
