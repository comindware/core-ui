/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers, htmlHelpers } from 'utils';

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

const eventBubblingIgnoreList = [
    'before:render',
    'render',
    'dom:refresh',
    'before:show',
    'show',
    'before:destroy',
    'destroy'
];

export default Marionette.Behavior.extend({
    initialize(options, view) {
        helpers.ensureOption(view.options, 'internalListViewReqres');
        this.listenTo(view, 'all', function(eventName) {
            if (eventBubblingIgnoreList.indexOf(eventName) !== -1) {
                return;
            }
            view.options.internalListViewReqres.request('childViewEvent', view, eventName, _.rest(arguments, 1));
        });
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
