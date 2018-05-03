//@flow
import template from '../templates/iconItem.html';
import itemDragHelper from '../templates/itemDragHelper.html';

const paletteItemClassNameSuffix = 'ld-icon-item_';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.reqres = options.reqres;

        _.bindAll(this, '__startDragging', '__stopDragging', '__dragDragging', '__onChildDragStart', '__onChildDragStop', '__onChildDragMove');
    },

    className: 'dev-palette-icon-item',

    template: Handlebars.compile(template),

    ui: {
        dragHandle: '.js-drag-handle'
    },

    classes: {
        collapsed: 'ld-list-item_collapsed',
        expanded: 'ld-list-item_expanded',
        disabled: 'ld-list-item_disabled'
    },

    onRender() {
        const iconsProperty = this.options.iconsProperty;
        const itemSuffix = this.model.get(iconsProperty || 'fieldType').toLowerCase();
        this.$el.addClass(paletteItemClassNameSuffix + itemSuffix);
        this.ui.dragHandle.draggable({
            appendTo: '.js-module-region',
            helper: () => $(itemDragHelper),
            cursorAt: {
                top: -30,
                left: -20
            },
            start: this.__startDragging,
            stop: this.__stopDragging,
            drag: this.__dragDragging
        });
    },

    childEvents: {
        'drag:start': '__onChildDragStart',
        'drag:stop': '__onChildDragStop',
        'drag:move': '__onChildDragMove'
    },

    __startDragging(event, ui) {
        const contextModel = this.reqres.request('element:create', this.model);
        this.dragContext = {
            operation: 'create',
            model: contextModel
        };
        this.__updateDragElementClass(ui.helper, contextModel);
        this.trigger('drag:start', this.dragContext, event, ui, this);
    },

    __stopDragging(event, ui) {
        this.trigger('drag:stop', this.dragContext, event, ui, this);
        this.dragContext = null;
    },

    __dragDragging(event, ui) {
        this.trigger('drag:move', this.dragContext, event, ui, this);
    },

    __onChildDragStart(dragContext, event, ui, view) {
        this.trigger('drag:start', dragContext, event, ui, view);
    },

    __onChildDragStop(dragContext, event, ui, view) {
        this.trigger('drag:stop', dragContext, event, ui, view);
    },

    __onChildDragMove(dragContext, event, ui, view) {
        this.trigger('drag:move', dragContext, event, ui, view);
    },

    __updateDragElementClass(dragHelper, componentModel) {
        const draggableItemSuffix = componentModel.get('fieldType').toLowerCase();
        dragHelper.find('.js-drag-title').text(componentModel.get('name'));
        dragHelper.find('.js-drag-subtitle').text(componentModel.get('pathNames'));
        dragHelper.addClass(paletteItemClassNameSuffix + draggableItemSuffix);
    }
});
