import { helpers } from 'utils';

const eventBubblingIgnoreList = ['before:render',
    'render',
    'dom:refresh',
    'before:show',
    'show',
    'before:destroy',
    'destroy'];

export default Marionette.Behavior.extend({
    initialize(options, view) {
        helpers.ensureOption(view.options, 'columns');
        helpers.ensureOption(view.options, 'gridEventAggregator');
        helpers.ensureOption(options, 'padding');

        this.padding = options.padding;
        this.columns = view.options.columns;
    },

    modelEvents: {
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        highlighted: '__handleHighlighting',
        unhighlighted: '__handleUnhighlighting'
    },

    events: {
        mousedown: '__handleClick'
    },

    ui: {
        cells: '.js-grid-cell'
    },

    onRender() {
        const model = this.view.model;
        if (model.selected) {
            this.__handleSelection();
        }
        if (model.highlighted) {
            this.__highlight(model.highlightedFragment);
        }
        if (document.body.contains(this.el)) {
            Marionette.triggerMethodOn(this.view, 'show');
        }
    },

    __getAvailableWidth() {
        return this.$el.width() - this.padding - 1; //Magic cross browser pixel, don't remove it
    },

    __handleClick(e) {
        const model = this.view.model;
        const selectFn = model.collection.selectSmart || model.collection.select;
        if (selectFn) {
            selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey);
        }
    },

    __handleHighlighting(sender, e) {
        this.__highlight(e.text);
    },

    __highlight(fragment) {
        this.view.onHighlighted(fragment);
    },

    __handleUnhighlighting() {
        this.view.onUnhighlighted();
    },

    __handleSelection() {
        this.$el.addClass('selected');
    },

    __handleDeselection() {
        this.$el.removeClass('selected');
    }
});
