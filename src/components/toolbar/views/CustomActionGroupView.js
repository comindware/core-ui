//@flow
import { severity, icons } from '../meta';
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

    onRender() {
        if (this.model) {
            const iconType = this.model.get('iconType');
            const severityLevel = this.model.get('severity');
            const severityItem = severity[severityLevel] || severity.None;

            this.$el.addClass(severityItem.class);
            if (iconType === icons.None) {
                this.$el.children('.js-icon-container').hide();
            } else {
                this.$el.children('.js-icon-container').show();
                this.$el.children('.js-icon-container').html(icons[iconType].icon);
            }
        }
    },

    childViewEvents: {
        'action:click': '__handleClick'
    },

    __handleClick(action) {
        this.trigger('actionSelected', action);
    }
});
