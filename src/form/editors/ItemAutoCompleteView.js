import template from './templates/itemAutoComplete.hbs';
import list from 'list';

const classes = {
    SELECTED: 'editor_checked'
};

export default Marionette.View.extend({
    className() {
        return 'dd-list__i';
    },

    tagName: 'tr',

    behaviors: [
        {
            behaviorClass: list.views.behaviors.ListItemViewBehavior,
            multiSelect: true,
            selectOnCursor: false
        }
    ],

    template: Handlebars.compile(template),

    onRender() {
        if (this.model.selected) {
            this.__markSelected();
        } else {
            this.__markDeselected();
        }
    },

    modelEvents: {
        selected: '__markSelected',
        deselected: '__markDeselected'
    },

    __markSelected() {
        this.el.classList.add(classes.SELECTED);
    },

    __markDeselected() {
        this.el.classList.remove(classes.SELECTED);
    }
});
