// @flow
import { helpers } from 'utils';
import WindowService from 'services/WindowService';
import template from './popup.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import GlobalEventService from '../../services/GlobalEventService';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import ButtonView from '../button/ButtonView';
import meta from 'Meta';

const classes = {
    CLASS_NAME: 'layout__popup-view',
    EXPAND: 'layout__popup-view-window_expand',
    CURSOR_AUTO: 'cur_aI'
};

const iconsNames = meta.iconsNames;

const TRANSITION = 100; //ms
const sizeVisibleChunk = 50; //px;

const expandId = _.uniqueId('expand');

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'header');
        helpers.ensureOption(options, 'buttons');
        helpers.ensureOption(options, 'content');

        this.content = options.content;
        this.onClose = options.onClose;
        this.__expanded = Boolean(options.expandOnShow);
    },

    template: Handlebars.compile(template),

    templateContext() {
        return Object.assign(
            {
                headerText: this.options.header
            },
            iconsNames
        );
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
        header: '.js-header',
        window: '.js-window',
        close: '.js-close',
        newTab: '.js-new-tab',
        fullscreenToggle: '.js-fullscreen-toggle',
        headerText: '.js-header-text'
    },

    events: {
        'click @ui.button': '__onButtonClick',
        'click @ui.close': 'close',
        'click @ui.newTab': '__openInNewTab',
        'click @ui.fullscreenToggle': '__fullscreenToggle'
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

        if (!this.options.newTabUrl) {
            this.ui.newTab.hide();
        }
        if (this.options.fullscreenToggleDisabled) {
            this.ui.fullscreenToggle.hide();
        }

        this.__initializeWindowDrag();
        if (this.options.expandOnShow) {
            this.__setFullScreen();
        }
    },

    onAttach() {
        this.__setDraggableContainment();
    },

    update() {
        if (this.content.update) {
            this.content.update();
        }
        this.__updateState();
    },

    validate() {
        const content = this.options.content;
        if (content.validate) {
            return content.validate();
        }
    },

    setHeader(eventTitle) {
        this.ui.headerText.text(eventTitle);
    },

    __openInNewTab() {
        if (Array.isArray(this.options.newTabUrl)) {
            window.open(...this.options.newTabUrl);
        } else {
            window.open(this.options.newTabUrl);
        }
        this.close();
    },

    __fullscreenToggle() {
        this.__expanded = !this.__expanded;
        this.__callWithTransition(
            () => this.__toggleIconClasses(),
            () => this.__toggleFullscreenClasses()
        );
    },

    __setFullScreen() {
        this.__toggleFullscreenClasses();
        this.__toggleIconClasses();
    },

    __toggleFullscreenClasses() {
        this.ui.window.draggable('option', 'disabled', this.__expanded);
        this.ui.window.toggleClass(classes.EXPAND, this.__expanded);
        this.ui.header.toggleClass(classes.CURSOR_AUTO, this.__expanded);
    },

    __toggleIconClasses() {
        this.ui.fullscreenToggle.toggleClass(`fa-${iconsNames.expand}`, !this.__expanded);
        this.ui.fullscreenToggle.toggleClass(`fa-${iconsNames.minimize}`, this.__expanded);
    },

    __callWithTransition(callback, callbackAfterTransition) {
        this.ui.window.css('transition', `all ${TRANSITION}ms ease-in-out 0s`);
        typeof callback === 'function' && callback();
        helpers.setUniqueTimeout(
            expandId,
            () => {
                this.ui.window.css('transition', 'unset');
                typeof callbackAfterTransition === 'function' && callbackAfterTransition();
            },
            TRANSITION
        );
    },

    async close() {
        if (WindowService.isPopupOnTop(this.popupId)) {
            if (this.onClose) {
                const closeResult = await this.onClose();

                return closeResult && WindowService.closePopup(this.popupId);
            }

            return WindowService.closePopup(this.popupId);
        }
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

        this.__debounceOnResize = _.debounce(this.__onResize, 300);
        this.listenTo(GlobalEventService, 'window:resize', this.__debounceOnResize);
    },

    __onResize() {
        if (this.isDestroyed()) {
            return;
        }
        this.__callWithTransition(() => {
            this.ui.window.css('top', 0);
            this.ui.window.css('left', 0);
        });
        this.__setDraggableContainment();
    },

    __setDraggableContainment() {
        this.ui.window.draggable('option', 'containment', [
            sizeVisibleChunk - this.ui.window.outerWidth(),
            0,
            window.innerWidth - sizeVisibleChunk,
            window.innerHeight - sizeVisibleChunk
        ]);
    },

    isNeedToPrevent() {
        return document.querySelector('.dev-codemirror-maximized') !== null || document.querySelector('.CodeMirror-hints') !== null;
    },

    setLoading(loading) {
        if (!this.isDestroyed()) {
            this.loading.setLoading(loading);
        }
    }
});
