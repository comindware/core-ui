// @flow
import { helpers } from 'utils';
import template from './button.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__button-view'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'text');
        helpers.ensureOption(options, 'handler');
    },

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            text: this.options.text
        };
    },

    className: classes.CLASS_NAME,

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    events: {
        click: '__onClick'
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
