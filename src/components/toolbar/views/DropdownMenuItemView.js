// @flow
import template from '../templates/dropdownMenuItemView.html';

export default Marionette.View.extend({
    tagName: 'li',

    className: 'popout-menu__i',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            getTitle: this.model.has('tooltip') ? this.model.get('tooltip') : this.model.get('name')
        };
    },

    events: {
        click() {
            this.trigger('execute', this.model);
        }
    }
});
