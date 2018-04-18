// @flow
import iconWrapRemoveBubble from '../../../iconsWraps/iconWrapRemoveBubble.html';
import iconWrapPencil from '../../../iconsWraps/iconWrapPencil.html';

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
    },

    template: false,

    tagName() {
        return this.url ? 'a' : 'li';
    },

    attributes() {
        this.text = this.options.getDisplayText(this.options.model.attributes);

        return {
            draggable: true,
            title: this.text,
            target: '_blank',
            tabindex: '-1',
            href: this.options.createValueUrl(this.model.attributes),
            text: this.text
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

    __delete() {
        this.reqres.request('bubble:delete', this.model);
        return false;
    },

    __click(e) {
        if (e.target.tagName === 'A') {
            e.stopPropagation();
        }
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

        this.$el.html(this.text);
    },

    __handleDrag(event) {
        event.data = {
            id: this.model.id,
            type: 'reference'
        };
    },

    __onMouseenter() {
        if (this.options.showEditButton && Boolean(this.model.attributes)) {
            this.el.insertAdjacentHTML('beforeend', iconWrapPencil);
        }
        if (this.options.enabled) {
            this.el.insertAdjacentHTML('beforeend', iconWrapRemoveBubble);
        }
    },

    __onMouseleave() {
        if (this.options.showEditButton && Boolean(this.model.attributes)) {
            this.el.removeChild(this.el.lastElementChild);
        }
        if (this.options.enabled) {
            this.el.removeChild(this.el.lastElementChild);
        }
    }
});
