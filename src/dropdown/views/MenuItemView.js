// @flow
import template from '../templates/menuItem.hbs';

/**
 * @name MenuView
 * @memberof module:core.dropdown.views
 * @class Single menu item used by MenuPanelView to display a list of menu items.
 * Factory method {@link module:core.dropdown.factory createMenu} uses it indirectly.
 * {@link module:core.dropdown.factory createMenu}.
 * @constructor
 * @extends Marionette.View
 * */

export default Marionette.View.extend({
    tagName: 'li',

    className: 'popout-menu__i',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            getTitle: this.model.has('tooltip') ? this.model.get('tooltip') : this.model.get('name')
        };
    },

    onRender() {
        if (this.model.get('selected')) {
            this.el.classList.add('popout-menu__i_selected');
        }
    },

    events: {
        click() {
            this.trigger('execute', this.model);
        }
    }
});
