import template from 'text-loader!../templates/demoDropdownItem.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    className: 'dropdown-list__i'
});
