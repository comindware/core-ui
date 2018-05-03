//@flow
import template from '../templates/customContextPaletteItem.html';
import itemDragHelper from '../templates/itemDragHelper.html';

const paletteItemClassNameSuffix = 'ld-list-item_';

export default Marionette.CompositeView.extend({
    initialize(options) {
        this.reqres = options.reqres;

        _.bindAll(this, '__startDragging', '__stopDragging', '__dragDragging', '__onChildDragStart', '__onChildDragStop', '__onChildDragMove');
        this.collection = this.model.get('children');
    },

    className: 'ld-list-item',

    template: Handlebars.compile(template),

    templateContext() {
        let title = '';
        const displayAttribute = this.options.displayPaletteAttribute;
        if (displayAttribute) {
            title = this.model.get(displayAttribute);
        } else {
            title = this.model.get('name');
        }
        return {
            title
        };
    },

    modelEvents: {
        collapsed: '__onModelCollapsed',
        expanded: '__onModelExpanded',
        highlighted: '__onHighlighted',
        unhighlighted: '__onUnhighlighted'
    },

    ui: {
        dragHandle: '.js-drag-handle',
        name: '.js-name',
        text: '.js-text'
    },

    events: {
        'click .js-toggle': '__toggleCollapsed',
        dblclick: '__editAttribute'
    },

    classes: {
        collapsed: 'ld-list-item_collapsed',
        expanded: 'ld-list-item_expanded',
        disabled: 'ld-list-item_disabled',
        static: 'dev-ld-list-item_static'
    },

    onRender() {
        const iconsProperty = this.options.iconsProperty;
        const itemSuffix = this.model.get(iconsProperty || 'fieldType').toLowerCase();
        this.$el.addClass(paletteItemClassNameSuffix + itemSuffix);
        this.$el.addClass(this.classes.static);
        this.__updateChildren(true);
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
        'drag:move': '__onChildDragMove',
        'context:toggle': '__onChildContextToggle',
        'element:dblclick': '__onDblClick'
    },

    childViewOptions() {
        return {
            reqres: this.reqres,
            isStaticTree: this.getOption('isStaticTree')
        };
    },

    childViewContainer: '.js-context-items-container',

    __onModelCollapsed() {
        this.__updateChildren();
    },

    __onModelExpanded() {
        this.__updateChildren();
    },

    __toggleCollapsed() {
        this.model.toggleCollapsed();
        return false;
    },

    __editAttribute() {
        if (!this.options.isStaticTree) {
            this.reqres.request('handle:edit', this.model);
        } else {
            this.trigger('element:dblclick', this.model);
        }
        return false;
    },

    __updateChildren(noTrigger) {
        if (!this.model.get('hasChildren')) {
            return;
        }
        const collapsed = this.model.getCollapsed();

        if (collapsed) {
            this.$el.children(this.childViewContainer).hide();
            this.$el.addClass(this.classes.collapsed);
            this.$el.removeClass(this.classes.expanded);
        } else {
            this.$el.children(this.childViewContainer).show();
            this.$el.removeClass(this.classes.collapsed);
            this.$el.addClass(this.classes.expanded);
        }
        if (!noTrigger) {
            this.trigger('context:toggle', collapsed);
        }
    },

    __onChildContextToggle(parentView, collapsed) {
        this.trigger('context:toggle', collapsed);
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
    },

    __onDblClick(view, model) {
        if (this.getOption('isStaticTree')) {
            this.trigger('element:dblclick', model);
        }
    },

    __onHighlighted(model) {
        const name = model.get('name');
        const text = model.get('text');
        const regexp = new RegExp(model.highlightedFragment, 'i');
        if (name && regexp.test(name)) {
            this.ui.name.html(Core.utils.htmlHelpers.highlightText(name, model.highlightedFragment));
        } else if (text && regexp.test(text)) {
            this.ui.text.html(Core.utils.htmlHelpers.highlightText(text, model.highlightedFragment));
        }
    },

    __onUnhighlighted(model) {
        const name = model.get('name');
        const text = model.get('text');
        if (name) {
            this.ui.name.text(name);
        } else if (text) {
            this.ui.text.text(text);
        }
    }
});
