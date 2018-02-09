
import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from '../templates/addNewButton.hbs';

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'reqres');
        this.reqres = options.reqres;
    },

    template: Handlebars.compile(template),

    events: {
        click: '__onClick'
    },

    className: 'reference-btn',

    __onClick() {
        this.reqres.trigger('add:new:item');
    }
});
