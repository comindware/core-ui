import template from '../../templates/blinkCheckbox/blinkCheckboxVisibility.html';

const constants = {
    iconClassConst: 'filter',
    colorIconEnabled: 'filter-enabled',
    colorIconDisabled: 'filter-disabled',
    dragging: 'dragging'
};

export default Marionette.View.extend({
    initialize() {
        this.listenTo(this.model, 'change', value => this.__displayVisibility(value.get('isHidden')));
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            iconClass: constants.iconClassConst,
            iconColor: this.model.get('isHidden') ? constants.colorIconDisabled : constants.colorIconEnabled
        };
    },

    className: 'filter-icon-list__i js-item',

    ui: {
        filterIcon: '.filter-icon',
        text: '.js-text',
        dragger: '.js-dragger'
    },

    events: {
        'click @ui.filterIcon': '__onClick',
        'click @ui.text': '__onClick',
        'mousedown @ui.dragger': '__onDrag'
    },

    onRender() {
        this.__displayVisibility(!this.model.get('isHidden'));
    },

    __onClick() {
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
        const filterIcon = this.ui.filterIcon;
        if (isVisible) {
            filterIcon.removeClass(constants.colorIconDisabled);
            filterIcon.addClass(constants.colorIconEnabled);
        } else {
            filterIcon.addClass(constants.colorIconDisabled);
            filterIcon.removeClass(constants.colorIconEnabled);
        }
    }
});
