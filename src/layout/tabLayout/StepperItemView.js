
import stepperItem from './templates/stepperItem.hbs';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(stepperItem),

    className: 'layout__tab-layout__header-view-item',

    triggers: {
        click: 'step:selected'
    },
});
