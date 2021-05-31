import template from '../templates/emptyRadioGroup.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'radiogroup-empty-view'
});
