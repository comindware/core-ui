/**
 * Developer: Stepan Burguchev
 * Date: 2/28/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from './button.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__button-view'
};

export default Marionette.ItemView.extend({
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

    onShow() {
        this.__updateState();
    },

    __onClick() {
        this.trigger('click');
        this.options.handler();
    },

    update() {
        this.__updateState();
    }
});
