import template from '../templates/referenceListItem.hbs';
import list from 'list';
import { htmlHelpers } from '../../../../../utils';

const classes = {
    SELECTED: 'editor_checked'
};

export default Marionette.View.extend({
    className() {
        return `dd-list__i${this.options.showCheckboxes ? ' dd-list__i_checkbox' : ''}`;
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

    templateContext() {
        const text = this.options.getDisplayText(this.model.toJSON());

        return {
            textForTitle: this.model.get('title') || htmlHelpers.getTextfromHTML(text),
            text,
            showCheckboxes: this.options.showCheckboxes
        };
    },

    ui: {
        checkbox: '.js-checkbox'
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
        const checkbox = this.ui.checkbox.get(0);
        if (checkbox) {
            checkbox.innerHTML = '<i class="fas fa-check"></i>';
        }
    },

    __markDeselected() {
        const checkbox = this.ui.checkbox.get(0);
        if (checkbox) {
            checkbox.innerHTML = '';
        }
    }
});
