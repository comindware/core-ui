import DefaultButtonView from './views/DefaultButtonView';
import MenuPanelView from './views/MenuPanelView';
import DropdownView from './views/DropdownView';

/**
 * The factory covers common use cases of Popout/Dropdown views.
 * You can create a simple menu (and other stuff like this) in one click without lots of manual work.
 * @namespace factory
 * @memberof module:core.dropdown
 * */

export default /** @lends module:core.dropdown.factory */ {
    /**
     * @description Метод служит для создания {@link module:core.dropdown.views.PopoutView PopoutView} в режиме диалога.
     *              Выпадающая панель занимает все пространство до низа экрана, а область вокруг затемняется.
     *              Метод устанавливает опции <code>{ fade: true, height: 'bottom' }</code>.
     * @param {Object} options Объект опций {@link module:core.dropdown.views.PopoutView PopoutView}
     * @returns {PopoutView} Экземпляр PopoutView
     * */
    createDialogPopout(options) {
        const defaults = {
            fade: true,
            height: 'bottom'
        };
        return this.createPopout(Object.assign(defaults, options));
    },

    /**
     * @description Метод вызывает стандартный конструктор
     *              {@link module:core.dropdown.views.DropdownView DropdownView} передавая ему опции 'as is'.
     * @param {Object} options Объект опций {@link module:core.dropdown.views.DropdownView DropdownView}
     * @returns {DropdownView} Экземпляр DropdownView
     * */
    createDropdown(options) {
        if (!options.buttonView) {
            options.buttonView = DefaultButtonView;
        }

        if (!options.panelView) {
            options.panelView = MenuPanelView;
        }

        return new DropdownView(options);
    }
};
