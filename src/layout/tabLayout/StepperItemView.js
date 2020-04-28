import stepperItem from './templates/stepperItem.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(stepperItem),

    className: 'layout__tab-layout__stepper_view-item',

    triggers: {
        click: 'step:selected'
    }
});
