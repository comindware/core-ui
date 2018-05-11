//@flow
import template from '../templates/customContextPalette.html';
import CustomAttributesItemView from './CustomAttributesItemView';
import CustomAttributesEmptyView from './CustomAttributesEmptyView';

const draggableHelperClassNameSuffix = 'ld-list-item_';

export default Marionette.CollectionView.extend({
    initialize() {
        _.bindAll(this, '__onChildDragStart', '__onChildDragStop', '__onChildDragMove');
    },

    className: 'region dev-custom-attributes',

    template: Handlebars.compile(template),

    childView: CustomAttributesItemView,

    emptyView: CustomAttributesEmptyView,

    childViewOptions() {
        return {
            reqres: this.getOption('reqres'),
            isStaticTree: this.getOption('isStaticTree'),
            displayPaletteAttribute: this.getOption('displayPaletteAttribute'),
            iconsProperty: this.getOption('iconsProperty')
        };
    },

    childViewEvents: {
        'drag:start': '__onChildDragStart',
        'drag:stop': '__onChildDragStop',
        'drag:move': '__onChildDragMove',
        'context:toggle': '__onChildContextToggle',
        'element:dblclick': '__onDblClick'
    },

    __onChildDragStart(dragContext, event, ui) {
        this.__updateDragElementClass(ui.helper, dragContext.model);
        this.trigger('element:drag:start', dragContext, event, ui);
    },

    __onChildDragStop(dragContext, event, ui) {
        this.trigger('element:drag:stop', dragContext, event, ui);
    },

    __onChildDragMove(dragContext, event, ui) {
        this.trigger('element:drag:move', dragContext, event, ui);
    },

    __onChildContextToggle() {
        this.trigger('context:toggle');
    },

    __updateDragElementClass(dragHelper, componentModel) {
        const draggableItemSuffix = componentModel.get('fieldType').toLowerCase();
        dragHelper.find('.js-drag-title').text(componentModel.get('name'));
        dragHelper.find('.js-drag-subtitle').text(componentModel.get('pathNames'));
        dragHelper.addClass(draggableHelperClassNameSuffix + draggableItemSuffix);
    },

    __onDblClick(model) {
        if (this.getOption('isStaticTree')) {
            this.trigger('element:dblclick', model);
        }
    }
});
