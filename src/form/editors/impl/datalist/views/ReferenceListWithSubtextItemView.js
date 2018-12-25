import template from '../templates/referenceListWithSubtextItem.hbs';
import list from 'list';

const classes = {
    SELECTED: 'editor_checked'
};

export default Marionette.View.extend({
    behaviors: [
        {
            behaviorClass: list.views.behaviors.ListItemViewBehavior,
            multiSelect: true,
            selectOnCursor: false
        }
    ],

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
        this.$el.addClass(classes.SELECTED);
        this.$el.find('.js-checkbox') && this.$el.find('.js-checkbox').addClass(classes.SELECTED);
    },

    __markDeselected() {
        this.$el.removeClass(classes.SELECTED);
        this.$el.find('.js-checkbox') && this.$el.find('.js-checkbox').removeClass(classes.SELECTED);
    },

    className: 'subtext-list',

    template: Handlebars.compile(template),

    templateContext() {
        const options = this.options.subTextOptions;
        const iconPropertyValue = this.model.get(options.iconProperty);
        const type = iconPropertyValue ? iconPropertyValue.toLocaleLowerCase() : '';
        const iconType = Core.meta.contextIconType[type] || null;
        return {
            text: this.options.getDisplayText(this.model.toJSON()),
            iconType,
            subtext: this.model.get(options.subtextProperty),
            showCheckboxes: this.options.showCheckboxes
        };
    }
});
