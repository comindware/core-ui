// @flow
import DropdownMenuItemView from './DropdownMenuItemView';
import ToolbarSplitter from './ToolbarSplitterView';
import meta from '../meta';

export default Marionette.CollectionView.extend({
    className: 'popout-menu',

    childView(model) {
        if (model.get('customView')) {
            return model.get('customView');
        }
        return model.get('type') !== meta.toolbarItemType.SPLITTER ? DropdownMenuItemView : ToolbarSplitter;
    },

    childViewEvents: {
        execute: '__execute'
    },

    __execute(model) {
        this.options.parent.close();
        this.options.parent.trigger('execute', model.id, model);
    }
});
