//@flow
import template from '../templates/customActionGroupView.html';
import CustomActionItemView from './CustomActionItemView';
import ToolbarActionMenuView from '../views/ToolbarActionMenuView';
import ToolbarCheckboxItemView from '../views/ToolbarCheckboxItemView';
import ToolbarSplitterView from '../views/ToolbarSplitterView';
import ToolbarPopupView from '../views/ToolbarPopupView';
import meta from '../meta';

export default Marionette.CollectionView.extend({
    className: 'js-icon-container toolbar-items-wrp',

    template: Handlebars.compile(template),

    childView(model) {
        switch (model.get('type')) {
            case meta.toolbarItemType.ACTION:
                return CustomActionItemView;
            case meta.toolbarItemType.GROUP:
                return ToolbarActionMenuView;
            case meta.toolbarItemType.SPLITTER:
                return ToolbarSplitterView;
            case meta.toolbarItemType.POPUP:
                return ToolbarPopupView;
            case meta.toolbarItemType.CHECKBOX:
                return ToolbarCheckboxItemView;
            default:
                return CustomActionItemView;
        }
    },

    childViewOptions() {
        return {
            reqres: this.getOption('reqres')
        };
    },

    childViewEvents: {
        'action:click': '__handleClick'
    },

    __handleClick(model) {
        this.trigger('actionSelected', model);
    }
});
