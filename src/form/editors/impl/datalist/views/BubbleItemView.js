// @flow
import iconWrapRemoveBubble from '../../../iconsWraps/iconWrapRemoveBubble.html';
import iconWrapPencil from '../../../iconsWraps/iconWrapPencil.html';
import template from '../templates/bubbleItem.hbs';

const classes = {
    SELECT: 'bubble_focused'
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            customTemplate: this.options.customTemplate ? Handlebars.compile(this.options.customTemplate)(this.model.toJSON()) : null,
            url: this.options.createValueUrl && this.options.createValueUrl(this.model.attributes),
            text: this.options.getDisplayText(this.options.model.attributes)
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

    events: {
        'click @ui.clearButton': '__delete',
        'click @ui.editButton': '__edit',
        click: '__click',
        drag: '__handleDrag',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave'
    },

    modelEvents: {
        'selected deselected': '__changeSelected',
        change: 'render'
    },

    __delete() {
        this.reqres.request('bubble:delete', this.model);
        return false;
    },

    __click(e) {
        if (e.target.tagName === 'A') {
            e.stopPropagation();
            return;
        }
        this.reqres.request('button:click');
    },

    __edit() {
        if (this.reqres.request('value:edit', this.model.attributes)) {
            return false;
        }
        return null;
    },

    updateEnabled(enabled) {
        this.options.enabled = enabled;
    },

    onRender() {
        this.updateEnabled(this.options.enabled);
        if (this.options.showEditButton && Boolean(this.model.attributes)) {
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
        this.$el.toggleClass(classes.SELECT, !!model.selected);
    },

    __onMouseenter() {
        if (this.options.showEditButton && Boolean(this.model.attributes)) {
            this.el.insertAdjacentHTML('beforeend', iconWrapPencil);
        }
        if (this.options.enabled && this.options.showRemoveButton) {
            this.el.insertAdjacentHTML('beforeend', iconWrapRemoveBubble);
        }
    },

    __onMouseleave() {
        if (this.options.showEditButton && Boolean(this.model.attributes)) {
            this.el.removeChild(this.el.lastElementChild);
        }
        if (this.options.enabled && this.options.showRemoveButton) {
            this.el.removeChild(this.el.lastElementChild);
        }
    }
});
