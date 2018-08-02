import template from 'text-loader!../templates/demoDropdownItem.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'dropdown-list__i'
});
