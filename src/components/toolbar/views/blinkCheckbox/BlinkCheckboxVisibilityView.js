import template from '../../templates/blinkCheckbox/blinkCheckboxVisibility.html';

const constants = {
    eyeClose: 'eyes-list-eye_close',
    eyeOpen: 'eyes-list-eye_open',
    dragging: 'dragging'
};

export default Marionette.View.extend({
    initialize() {
        this.listenTo(this.model, 'change', value => this.__displayVisibility(value.get('isHidden')));
    },

    template: Handlebars.compile(template),

    className: 'eyes-list__i js-item',

    ui: {
        eye: '.js-eye',
        dragger: '.js-dragger'
    },

    events: {
        'click @ui.eye': '__onEyeClick',
        'mousedown @ui.dragger': '__onDrag'
    },

    onRender() {
        this.__displayVisibility(!this.model.get('isHidden'));
    },

    __onEyeClick() {
        this.model.set('isHidden', !this.model.get('isHidden'));
        this.__displayVisibility(!this.model.get('isHidden'));
        this.trigger('click', this.model);
    },

    __onDrag(e) {
        this.trigger('drag', this, {
            model: this.model,
            event: e
        });
        return false;
    },

    setDragging(isDragging) {
        if (isDragging) {
            this.$el.addClass(constants.dragging);
        } else {
            this.$el.removeClass(constants.dragging);
        }
    },

    __displayVisibility(isVisible) {
        const eye = this.ui.eye;
        if (isVisible) {
            eye.removeClass(constants.eyeClose);
            eye.addClass(constants.eyeOpen);
        } else {
            eye.addClass(constants.eyeClose);
            eye.removeClass(constants.eyeOpen);
        }
    }
});
