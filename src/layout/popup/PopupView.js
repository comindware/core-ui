/**
 * Developer: Stepan Burguchev
 * Date: 2/28/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import WindowService from 'services/WindowService';
import template from './popup.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import GlobalEventService from '../../services/GlobalEventService';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';

const classes = {
    CLASS_NAME: 'layout__popup-view'
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'header');
        helpers.ensureOption(options, 'buttons');
        helpers.ensureOption(options, 'content');

        this.listenTo(GlobalEventService, 'window:keydown:captured', (document, event) => this.__keyAction(event));
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
        },
        LoadingBehavior: {
            behaviorClass: LoadingBehavior,
            region: 'loadingRegion'
        }
    },

    ui: {
        button: '.js-button',
        window: '.js-window',
        close: '.js-close'
    },

    events: {
        'click @ui.button': '__onButtonClick',
        'click @ui.close': '__close'
    },

    regions: {
        contentRegion: '.js-content-region',
        loadingRegion: '.js-loading-region',
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

    __keyAction(event) {
        if (event.keyCode === 27) {
            this.__close();
        }
    },

    __onButtonClick(e) {
        let id = $(e.target).data('id');
        if (id === undefined) {
            id = $(e.target.parentElement).data('id');
        }
        const button = this.__buttons.find(x => x.id === id);
        button.handler(this);
        this.trigger('button', id);
    },

    __close() {
        WindowService.closePopup();
    },

    setLoading(loading) {
        if (!this.isDestroyed) {
            this.loading.setLoading(loading);
        }
    }
});
