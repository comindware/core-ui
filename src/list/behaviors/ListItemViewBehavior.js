/*
    This behavior adds to an item the expect list item behaviors: selectable and highlightable.
    
    The selectable behavior expects that the model implements SelectableBehavior and works as follows:
    
    1. The 'selected' class is set to $el when the model is selected.
    2. The item becomes selected on $el `mousedown` event. NOTE: use stopPropagation() method in a child element's `mousedown` callback
        to prevent item selection.
    
    The highlightable behavior expects that the model implements HighlightableBehavior and works as follows:
    
    1. Highlighting expect that view has onHighlighted(fragment) and onUnhighlighted() methods to render text highlighting.

    IMPLEMENTATION NOTE: onHighlighted(text) and onUnhighlighted() methods are expected to modify element's DOM marking
    highlighted text with <SPAN class='highlight'> tags. Please note the following:

    1. The htmlHelpers.highlightText(text, fragment, escape = true) function was created for this purpose and recommended
        to use for implementation. It also escapes the input text by default.
    2. (!) Be sure that the text you set into html is escaped.
*/

const eventBubblingIgnoreList = ['before:render',
    'render',
    'dom:refresh',
    'before:show',
    'show',
    'before:destroy',
    'destroy'];

export default Marionette.Behavior.extend({
    initialize(options, view) {
        this.__debounceClickHandle = _.debounce(this.__handleDebouncedClick, 300, true);
    },

    modelEvents: {
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        highlighted: '__handleHighlighting',
        unhighlighted: '__handleUnhighlighting',
        pointed: '__handlePointedOn',
        unpointed: '__handlePointedOff'
    },

    events: {
        click: '__handleClick'
    },

    onRender() {
        const model = this.view.model;
        if (model.selected) {
            this.__handleSelection();
        }
        if (model.highlighted) {
            this.__highlight(model.highlightedFragment);
        }
    },

    __handleClick(e) {
        this.__debounceClickHandle(e);
    },

    __handleHighlighting(e) {
        this.__highlight(e.text);
    },

    __highlight(fragment) {
        this.view.onHighlighted(fragment);
    },

    __handleUnhighlighting() {
        this.view.onUnhighlighted();
    },

    __handleSelection() {
        this.getOption('selectOnCursor') !== false && this.$el.addClass('selected');
    },

    __handleDeselection() {
        this.getOption('selectOnCursor') !== false && this.$el.removeClass('selected');
    },

    __handlePointedOn() {
        this.$el.addClass('selected');
    },

    __handlePointedOff() {
        this.$el.removeClass('selected');
    },

    __handleDebouncedClick(e) {
        const model = this.view.model;
        if (model.selected) {
            model.deselect();
            return;
        }

        if (typeof this.view.options.canSelect === 'function') {
            if (!this.view.options.canSelect()) {
                return;
            }
        }

        const selectFn = this.getOption('multiSelect') ? model.collection.select : model.collection.selectSmart || model.collection.select;
        if (selectFn) {
            selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey, this.getOption('selectOnCursor'));
        }
    }
});
