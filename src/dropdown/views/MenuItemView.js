// @flow
import template from '../templates/menuItem.hbs';

/**
 * @name MenuItemView
 * @memberof module:core.dropdown.views
 * @class Single menu item used by MenuPanelView to display a list of menu items.
 * Factory method {@link module:core.dropdown.factory createMenu} uses it indirectly.
 * {@link module:core.dropdown.factory createMenu}.
 * @constructor
 * @extends Marionette.ItemView
 * */

export default Marionette.ItemView.extend({
    tagName: 'li',

    className: 'popout-menu__i',

    template: Handlebars.compile(template),

    templateHelpers() {
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
