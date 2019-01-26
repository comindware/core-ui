// @flow
import ListPanelView from './ListPanelView';
import MenuItemView from './MenuItemView';

/**
 * @name MenuPanelView
 * @memberof module:core.dropdown.views
 * @class Одиночный элемент меню. Используется для создания стандартного меню фабричным методом
 * @class List view used to display a list of menu items.
 * Factory method {@link module:core.dropdown.factory createMenu} uses it to create a menu.
 * {@link module:core.dropdown.factory createMenu}.
 * @constructor
 * @extends module:core.dropdown.views.ListPanelView
 * */

export default ListPanelView.extend({
    initialize() {
        ListPanelView.prototype.initialize.apply(this, Array.from(arguments));
    },

    className: 'popout-menu',

    childView(model: Backbone.Model) {
        if (model.get('customView')) {
            return model.get('customView');
        }
        return MenuItemView;
    },

    childViewEvents: {
        execute: '__execute'
    },

    __execute(model: Backbone.Model) {
        this.options.parent.close();
        this.options.parent.trigger('execute', model.id, model);
    }
});
