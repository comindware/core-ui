import { helpers, keyCode } from 'utils';
import template from './button.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__button',
    PALE: 'btn-pale',
    STRONG: 'btn-strong',
    DISABLED: 'btn-disabled',
    SOLID: 'btn-solid',
    ICON_RIGHT: 'btn-rightside-icon'
};

const defaultOptions = {
    isSolid: false
};

export default Marionette.View.extend({
    initialize(options) {
        this.options = _.defaults({}, options, defaultOptions);
        helpers.ensureOption(options, 'text');
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            brightnessClass: this.getOption('isCancel') ? classes.PALE : classes.STRONG,
            solidClass: this.getOption('isSolid') ? classes.SOLID : '',
            text: this.options.text,
            iconClass: this.options.iconClass,
            iconPosition: this.options.iconPosition,
            customClass: this.options.customClass
        };
    },

    tagName() {
        const url = this.model?.get('url');
        return url ? 'a' : 'div';
    },

    attributes() {
        if (!this.model) {
            return;
        }
        const attributes = {
            tabindex: 0,
            title: this.model.get('description') || this.model.get('name') || ''
        };
        const url = this.model.get('url');
        if (url) {
            attributes.href = url;
        }

        return attributes;
    },

    className() {
        return `${classes.CLASS_NAME} ${this.options.class || ''}`;
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    ui: {
        btn: '.js-btn'
    },

    events: {
        'click @ui.btn': '__onClick',
        keyup(event) {
            [keyCode.ENTER, keyCode.SPACE].includes(event.keyCode) && this.__onClick();
        }
    },

    onRender() {
        this.on('change:enabled', (view, state) => this.$el.toggleClass(classes.DISABLED, !state));
        this.__updateState();

        if (this.options.iconPosition === 'right') {
            this.ui.btn.addClass(classes.ICON_RIGHT);
        }
    },

    __onClick() {
        if (typeof this.options.handler === 'function') {
            this.handlerResult = this.options.handler(this.options.context);
        }
        this.trigger('click');
    },

    update() {
        this.__updateState();
    }
});
