import MenuPanelView from '../../dropdown/views/MenuPanelView';
import HeaderMenuPanelItemView from './HeaderMenuPanelItemView';

export default MenuPanelView.extend({
    childView() {
        return HeaderMenuPanelItemView;
    }
});
