import { helpers, keyCode } from 'utils';
import template from './button.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__button',
    PALE: 'btn-pale',
    STRONG: 'btn-strong'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'text');
        helpers.ensureOption(options, 'handler');
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            customClass: this.options.class || '',
            brightnessClass: this.options.id === false ? classes.PALE : classes.STRONG,
            text: this.options.text,
            iconClass: this.options.iconClass
        };
    },

    className: classes.CLASS_NAME,

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
        keyup: function(event) {
            [keyCode.ENTER, keyCode.SPACE].includes(event.keyCode) && this.__onClick();
        }
    },

    onRender() {
        this.__updateState();
    },

    __onClick() {
        this.trigger('click');
        this.options.handler(this.options.context);
    },

    update() {
        this.__updateState();
    }
});
