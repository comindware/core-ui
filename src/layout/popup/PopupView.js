/**
 * Developer: Stepan Burguchev
 * Date: 2/28/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from './popup.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__popup-view'
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'header');
        helpers.ensureOption(options, 'buttons');
        helpers.ensureOption(options, 'content');

        this.__buttons = this.options.buttons.map(x => Object.assign({
            id: _.uniqueId('buttonId')
        }, x));

        this.content = options.content;
    },

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            headerText: this.options.header,
            buttons: this.__buttons
        };
    },

    className: classes.CLASS_NAME,

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    ui: {
        button: '.js-button',
        window: '.js-window',
        close: '.js-close'
    },

    events: {
        'click @ui.button': '__onButtonClick'
    },

    triggers: {
        'click @ui.close': 'close'
    },

    regions: {
        contentRegion: '.js-content-region'
    },

    onRender() {
        if (this.options.size) {
            this.ui.window.css(this.options.size);
        }
    },

    onShow() {
        this.contentRegion.show(this.options.content);
        this.__updateState();
    },

    update() {
        if (this.content.update) {
            this.content.update();
        }
        this.__updateState();
    },

    __onButtonClick(e) {
        const id = $(e.target).data('id') || $(e.target.parentElement).data('id');
        const button = this.__buttons.find(x => x.id === id);
        button.handler(this);
        this.trigger('button', id);
    }
});
