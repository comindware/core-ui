// @flow
import ListPanelView from './ListPanelView';
import MenuItemView from './MenuItemView';
import factory from '../factory';

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

    childView(model) {
        if (model.get('customView')) {
            return model.get('customView');
        }
        if (model.get('isSubMenu')) {
            return class Test {
                constructor() {
                    return factory.createMenu({
                        items: model.get('items'),
                        buttonModel: model,
                        buttonView: MenuItemView,
                        popoutFlow: 'right',
                        panelPosition: 'right',
                        openOnMouseenter: true
                    });
                }
            };
        }
        return MenuItemView;
    },

    childViewEvents: {
        execute: '__execute',
        mouseenter: '__onMouseEnter',
        open: '__onChildOpen'
    },

    __execute(first, second) {
        const model = typeof first === 'string' ? second : first;
        if (model.get('isSubMenu')) {
            return;
        }
        this.options.parent.close();
        this.options.parent.button.trigger('execute', model.id, model);
    },

    __onMouseEnter() {
        if (this.__opendItem) {
            this.__opendItem.close();
        }
    },

    __onChildOpen(item) {
        this.__opendItem = item;
    }
});
