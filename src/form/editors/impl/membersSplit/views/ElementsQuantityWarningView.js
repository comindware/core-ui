// @flow
import template from '../templates/elementsQuantityWarning.hbs';

export default Marionette.View.extend({
    className: 'member-select__elements_quantity_warning',

    template: Handlebars.compile(template)
});
