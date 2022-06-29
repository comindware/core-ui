import template from '../templates/menuItem.hbs';

const separator = 'Separator';

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

    className() {
        const isSeparator = this.model.get('type') === separator;
        if (isSeparator) {
            return 'menu-btn-separator';
        }
        return 'popout-menu__i';
    },

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
            if (this.model.get('url')) {
                return;
            }
            this.trigger('execute', this.model);
        }
    },

    triggers: {
        mouseenter: 'mouseenter'
    }
});
