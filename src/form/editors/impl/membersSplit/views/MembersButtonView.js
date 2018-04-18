

import template from '../templates/membersButton.html';

export default Marionette.View.extend({
    className: 'dev-members-editor__dropdown-view__button-view',

    template: Handlebars.compile(template)
});
