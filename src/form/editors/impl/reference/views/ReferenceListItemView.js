import template from '../templates/referenceListItem.hbs';
import list from 'list';

const classes = {
    SELECTED: 'editor_checked'
};

export default Marionette.View.extend({
    className() {
        return `dd-list__i${this.options.showCheckboxes ? ' dd-list__i_checkbox' : ''} ${this.options.class || ''}`;
    },

    behaviors: [{
        behaviorClass: list.views.behaviors.ListItemViewBehavior,
        multiSelect: true,
        selectOnCursor: false
    }],

    template: Handlebars.compile(template),

    templateContext() {
        const arrDisplayAttribute = Array.isArray(this.options.displayAttribute) ? this.options.displayAttribute : [this.options.displayAttribute];
        const lines = arrDisplayAttribute.map(attr => ({
            text: this.options.getDisplayText(this.model.toJSON(), attr)
        }));
        return {
            showCheckboxes: this.options.showCheckboxes,
            lines
        };
    },

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
        this.$el.find('.js-checkbox') && this.$el.find('.js-checkbox').addClass(classes.SELECTED);
    },

    __markDeselected() {
        this.$el.find('.js-checkbox') && this.$el.find('.js-checkbox').removeClass(classes.SELECTED);
    }
});
