// @flow
import iconWrapRemoveBubble from '../../../iconsWraps/iconWrapRemoveBubble.html';
import iconWrapPencil from '../../../iconsWraps/iconWrapPencil.html';
import meta from '../meta';

export default Marionette.View.extend({
    template: Handlebars.compile('{{{customTemplate}}}'),

    templateContext() {
        const attributes = this.model.toJSON();
        const data = {
            url: this.options.createValueUrl && this.options.createValueUrl(attributes),
            text: this.options.getDisplayText(attributes),
            ...attributes
        };
        return {
            customTemplate: Handlebars.compile(this.options.customTemplate)(data),
            subtext: this.options.showButtonSubtext ? this.options.getDisplayText(attributes, this.options.subtextProperty) : null
        };
    },

    attributes() {
        return {
            draggable: true,
            title: this.options.getDisplayText(this.options.model.attributes),
            tabindex: '-1'
        };
    },

    className: 'bubbles__i',

    ui: {
        clearButton: '.js-bubble-delete',
        editButton: '.js-edit-button'
    },

    events() {
        const events = {
            'click @ui.clearButton': '__delete',
            drag: '__handleDrag',
            mouseenter: '__onMouseenter',
            mouseleave: '__onMouseleave'
        };

        if (this.options.edit) {
            events['click @ui.editButton'] = '__edit';
        }

        return events;
    },

    modelEvents: {
        'selected deselected': '__changeSelected',
        change: 'render'
    },

    __delete() {
        this.options.bubbleDelete(this.model);
        return false;
    },

    __edit() {
        if (this.options.edit && this.options.edit(this.model.attributes)) {
            return false;
        }
        return null;
    },

    updateEnabled(enabled) {
        this.options.enabled = enabled;
    },

    onRender() {
        this.updateEnabled(this.options.enabled);
        if (this.options.edit && Boolean(this.model.attributes)) {
            this.el.classList.add('bubbles__i-edit-btn');
        }
        this.__changeSelected(this.model);
    },

    __handleDrag(event) {
        event.data = {
            id: this.model.id,
            type: 'reference'
        };
    },

    __changeSelected(model, options) {
        this.$el.toggleClass(meta.classes.BUBBLE_SELECT, !!model.selected);
    },

    __onMouseenter() {
        if (this.options.edit && Boolean(this.model.attributes)) {
            this.el.insertAdjacentHTML('beforeend', iconWrapPencil);
        }
        if (this.options.enabled && this.options.canDeleteItem) {
            this.el.insertAdjacentHTML('beforeend', iconWrapRemoveBubble);
            this.el.classList.add(meta.classes.PENCIL_EDIT);
        }
    },

    __onMouseleave() {
        if (this.options.edit && Boolean(this.model.attributes)) {
            this.el.removeChild(this.el.lastElementChild);
        }
        if (this.options.enabled && this.options.canDeleteItem) {
            this.el.removeChild(this.el.lastElementChild);
            this.el.classList.remove(meta.classes.PENCIL_EDIT);
        }
    }
});
