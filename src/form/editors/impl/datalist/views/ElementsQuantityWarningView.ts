import template from '../templates/elementsQuantityWarning.hbs';

export default Marionette.View.extend({
    className: 'bubble_editor__elements_quantity_warning',

    template: Handlebars.compile(template)
});
