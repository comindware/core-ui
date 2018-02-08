
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

export default Marionette.View.extend({
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

    templateContext() {
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
        this.ui.window.css({ top: -50 });

        this.showChildView('contentRegion', this.options.content);
        this.__updateState();
        this.ui.window.css({ top: 'inherit' });
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
