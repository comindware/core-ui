// @flow
import { helpers } from 'utils';
import WindowService from 'services/WindowService';
import template from './popup.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import GlobalEventService from '../../services/GlobalEventService';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import ButtonView from '../button/ButtonView';

const classes = {
    CLASS_NAME: 'layout__popup-view'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'header');
        helpers.ensureOption(options, 'buttons');
        helpers.ensureOption(options, 'content');

        this.listenTo(GlobalEventService, 'window:keydown:captured', (document, event) => this.__keyAction(event));
        this.content = options.content;
        this.onClose = options.onClose;
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            headerText: this.options.header
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
        buttonsRegion: '.js-buttons-region',
        loadingRegion: '.js-loading-region'
    },

    onRender() {
        if (this.options.size) {
            this.ui.window.css(this.options.size);
        }
        this.ui.window.css({ top: -50 });
        this.showChildView('contentRegion', this.options.content);
        this.showChildView('buttonsRegion', this.__createButtonsView());
        this.__updateState();
        this.ui.window.css({ top: 'inherit' });

        this.__initializeWindowDrag();
    },

    update() {
        if (this.content.update) {
            this.content.update();
        }
        this.__updateState();
    },

    __keyAction(event) {
        const isNeedToPrevent = this.__isNeedToPrevent();

        if (!isNeedToPrevent && event.keyCode === 27) {
            this.__close();
        }
    },

    async __close() {
        if (this.onClose) {
            const closeResult = await this.onClose();

            closeResult && WindowService.closePopup();
        } else {
            WindowService.closePopup();
        }
        window.removeEventListener('resize', this.__debounceResize);
    },

    __createButtonsView() {
        const buttons = this.options.buttons.map(item => new ButtonView(Object.assign({ context: this }, item)));

        return new Core.layout.HorizontalLayout({
            columns: buttons
        });
    },

    __initializeWindowDrag() {
        this.ui.window.draggable({
            scroll: false,
            handle: '.js-header'
        });

        this.__debounceResize = _.debounce(() => // eslint-disable-line no-unused-expressions
            this.ui.window.draggable( 'option', 'containment', [-380, 0, $('html').outerWidth() - 100, $('html').outerHeight() - 100]), //first digit should be less min-width
        300),

        this.__debounceResize();

        window.addEventListener('resize', this.__debounceResize);
    },

    __isNeedToPrevent() {
        return document.querySelector('.dev-codemirror-maximized') !== null;
    },

    setLoading(loading) {
        if (!this.isDestroyed()) {
            this.loading.setLoading(loading);
        }
    }
});
