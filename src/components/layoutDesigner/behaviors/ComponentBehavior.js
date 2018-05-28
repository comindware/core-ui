//@flow
import componentDragHelper from '../templates/componentDragHelper.html';
import emptyDragHelper from '../templates/emptyComponentDragHelper.html';
//import { helpers } from 'utils';

const classes = {
    SELECTED: 'selected',
    HOVERED: 'dev-hovered',
    ERROR: 'fb-error',
    INVALID: 'ld-invalid'
};

const defaultOptions = {
    draggable: true
};

export default Marionette.Behavior.extend({
    initialize(options, view) {
        //helpers.ensureOption(options, 'canvasReqres');
        const viewOptions = view.options;

        this.view.reqres = viewOptions.reqres;
        this.view.canvasAggregator = viewOptions.canvasAggregator;
        this.canvasReqres = viewOptions.canvasReqres;
        this.view.componentReqres = viewOptions.componentReqres;
        _.extend(this.options, defaultOptions, options);
        _.bindAll(this, '__startDragging', '__stopDragging', '__dragDragging');
        this.view.isOver = this.__isOver;
    },

    modelEvents: {
        selected: '__updateSelection',
        deselected: '__updateSelection',
        'change:error': '__updateErrorSelection',
        'change:collapsed': '__updateCollapsed',
        hovered: '__updateHover',
        unhovered: '__updateHover',
        'change:invalid': '__updateValidity'
    },

    events: {
        click: '__select'
    },

    highlightComponent() {
        this.$el.toggleClass(classes.ERROR);
    },

    onRender() {
        this.__updateSelection();
        if (this.options.draggable) {
            this.$el.draggable({
                appendTo: '.js-module-region',
                helper() {
                    return this.$el.hasClass('js-system-container') && this.$el.parentElement.hasClass('js-form-region') ? $(emptyDragHelper) : $(componentDragHelper);
                },
                cursorAt: {
                    top: -45,
                    left: -40
                },
                start: this.__startDragging,
                stop: this.__stopDragging,
                drag: this.__dragDragging
            });
        }

        if (this.view.model.get('renderOnChange')) {
            this.listenTo(this.view.model, 'change', this.view.render.bind(this));
        }
    },

    __updateHover() {
        if (this.view.model.hovered) {
            this.$el.addClass(classes.HOVERED);
        } else {
            this.$el.removeClass(classes.HOVERED);
        }
    },

    __select() {
        this.canvasReqres.request('component:select', this.view.model);
        return false;
    },

    __updateSelection() {
        if (this.view.model.selected) {
            this.$el.addClass(classes.SELECTED);
        } else {
            this.$el.removeClass(classes.SELECTED);
        }
    },

    __startDragging(event, ui) {
        this.dragContext = {
            operation: 'move',
            model: this.view.model
        };
        this.__updateDragElementClass(ui.helper, this.view.model);

        const canBeDropped = this.canvasReqres.request('component:drag:start', this.view, this.dragContext, event, ui);
        return canBeDropped;
    },

    __stopDragging(event, ui) {
        this.canvasReqres.request('component:drag:stop', this.view, this.dragContext, event, ui);
        this.dragContext = null;
    },

    __dragDragging(event, ui) {
        this.canvasReqres.request('component:drag:move', this.view, this.dragContext, event, ui);
    },

    __updateErrorSelection() {
        if (this.view.model.get('error')) {
            this.$el.addClass(classes.ERROR);
        } else {
            this.$el.removeClass(classes.ERROR);
        }
    },

    __isOver() {
        return this.$el.is(':hover');
    },

    __updateCollapsed(model, collapsed, options) {
        this.canvasReqres.request('component:collapse', model, collapsed, options);
    },

    __updateDragElementClass(dragHelper, componentModel) {
        dragHelper.find('.js-drag-title').text(componentModel.get('name'));
        dragHelper.find('.js-drag-subtitle').text(componentModel.get('pathNames'));
    },

    __updateValidity() {
        if (this.view.model.get('invalid')) {
            this.$el.addClass(classes.INVALID);
        } else {
            this.$el.removeClass(classes.INVALID);
        }
    }
});
