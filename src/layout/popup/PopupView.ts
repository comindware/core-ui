// @flow
import { helpers } from 'utils';
import WindowService from 'services/WindowService';
import template from './popup.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import GlobalEventService from '../../services/GlobalEventService';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import ButtonView from '../button/ButtonView';
import meta from 'Meta';
import MobileService from 'services/MobileService';

const classes = {
    CLASS_NAME: 'layout__popup-view',
    MOBILE: 'layout__popup-view_mobile',
    MOBILE_SYSTEM_TYPE: 'layout__popup-view_mobile-system-type',
    EXPAND: 'layout__popup-view-window_expand',
    CURSOR_AUTO: 'cur_aI'
};

const iconsNames = meta.iconsNames;

const defaultOptions = {
    expand: false
};

const TRANSITION = 100; //ms
const sizeVisibleChunk = 50; //px;

export default Marionette.View.extend({
    initialize() {
        _.defaults(this.options, defaultOptions);
        this.content = this.options.content;
        this.onClose = this.options.onClose;

        _.bindAll(this, '__drag', '__startDrag', '__stopDrag');
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            headerText: this.options.header,
            ...iconsNames
        };
    },

    className() {
        if (MobileService.isMobile && !this.options.isSystemPopup) {
            return classes.MOBILE;
        } else if (MobileService.isMobile && this.options.isSystemPopup) {
            return classes.MOBILE_SYSTEM_TYPE;
        }
        return classes.CLASS_NAME;
    },

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
        'click @ui.fullscreenToggle': '__fullscreenToggle',
        'mousedown @ui.header': '__startDrag'
    },

    regions: {
        contentRegion: '.js-content-region',
        buttonsRegion: '.js-buttons-region',
        loadingRegion: '.js-loading-region'
    },

    onRender() {
        if (this.options.size && !MobileService.isMobile) {
            this.ui.window.css(this.options.size);
        }
        this.__setExpandState(this.options.expand);
        this.showChildView('contentRegion', this.options.content);
        this.showChildView('buttonsRegion', this.__createButtonsView());
        this.__updateState();

        if (!this.options.newTabUrl) {
            this.ui.newTab[0].setAttribute('hidden', '');
        }
        if (this.options.fullscreenToggleDisabled) {
            this.ui.fullscreenToggle[0].setAttribute('hidden', '');
        }

        this.__debounceOnResize = _.debounce(this.__onResize, 300);
        this.listenTo(GlobalEventService, 'window:resize', this.__debounceOnResize);
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

    setHeader(eventTitle: string) {
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
        this.__callWithTransition(() => this.__setExpandState(this.__expanded));
    },

    __setExpandState(expandState: boolean) {
        this.__expanded = expandState;
        this.ui.window.toggleClass(classes.EXPAND, this.__expanded);
        this.ui.header.toggleClass(classes.CURSOR_AUTO, this.__expanded);
        this.ui.fullscreenToggle.toggleClass(`fa-${iconsNames.expand}`, !this.__expanded);
        this.ui.fullscreenToggle.toggleClass(`fa-${iconsNames.minimize}`, this.__expanded);
    },

    __callWithTransition(callback: Function | undefined, callbackAfterTransition: Function | undefined) {
        this.ui.window.css('transition', `all ${TRANSITION}ms ease-in-out 0s`);
        typeof callback === 'function' && callback();
        setTimeout(() => {
            this.ui.window.css('transition', 'unset');
            typeof callbackAfterTransition === 'function' && callbackAfterTransition();
        }, TRANSITION);
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
        const buttons = this.options.buttons.map(item => new ButtonView({ context: this, ...item }));

        return new Core.layout.HorizontalLayout({
            columns: buttons
        });
    },

    __startDrag(startEvent: MouseEvent) {
        if (this.__expanded) {
            return;
        }
        this.__setCurrentDragContext(startEvent);
        document.addEventListener('mousemove', this.__drag);
        document.addEventListener('mouseup', this.__stopDrag);
    },

    __setCurrentDragContext(startEvent: MouseEvent) {
        const windowEl = this.ui.window.get(0);
        this.dragContext = {
            startEvent,
            startStyleLeft: parseFloat(windowEl.style.left || '0'),
            startStyleTop: parseFloat(windowEl.style.top || '0'),
            startOffsetTop: windowEl.offsetTop,
            startOffsetLeft: windowEl.offsetLeft,
            windowWidth: windowEl.offsetWidth,
            documentWidth: document.body.offsetWidth,
            documentHeight: document.body.offsetHeight
        };
    },

    __stopDrag() {
        document.removeEventListener('mousemove', this.__drag);
        document.removeEventListener('mouseup', this.__stopDrag);
        this.__checkPosition();
        delete this.dragContext;
    },

    __drag(e) {
        if (this.__eventOutOfClient(e)) {
            return;
        }
        const diffX = e.clientX - this.dragContext.startEvent.clientX;
        const diffY = e.clientY - this.dragContext.startEvent.clientY;

        this.ui.window[0].style.left = `${this.dragContext.startStyleLeft + diffX}px`;
        this.ui.window[0].style.top = `${this.dragContext.startStyleTop + diffY}px`;
    },

    __eventOutOfClient(e) {
        return e.clientX > this.dragContext.documentWidth || e.clientY > this.dragContext.documentHeight || e.clientX < 0 || e.clientY < 0;
    },

    __getCorrectPopupDiffs(assumedDiffX, assumedDiffY) {
        return {
            diffX: this.__checkLeftContainment(this.__checkRightContainment(assumedDiffX)),
            diffY: this.__checkTopContainment(this.__checkBottomContainment(assumedDiffY))
        };
    },

    __checkPosition() {
        this.__setCurrentDragContext();
        const { diffX, diffY } = this.__getCorrectPopupDiffs(0, 0);

        if (diffX !== 0) {
            this.ui.window[0].style.left = `${this.dragContext.startStyleLeft + diffX}px`;
        }
        if (diffY !== 0) {
            this.ui.window[0].style.top = `${this.dragContext.startStyleTop + diffY}px`;
        }
        delete this.dragContext;
    },

    __checkTopContainment(diffY) {
        const offsetTop = this.dragContext.startOffsetTop + diffY;

        if (offsetTop < 0) {
            return -this.dragContext.startOffsetTop;
        }
        return diffY;
    },

    __checkBottomContainment(diffY) {
        const offsetTop = diffY + this.dragContext.startOffsetTop;
        const heightExcess = offsetTop + sizeVisibleChunk - this.dragContext.documentHeight;

        if (heightExcess > 0) {
            return diffY - heightExcess;
        }
        return diffY;
    },

    __checkLeftContainment(diffX) {
        const offsetLeft = diffX + this.dragContext.startOffsetLeft;
        const offsetWidth = this.dragContext.windowWidth;
        const visibleChunk = offsetLeft + offsetWidth;
        const lack = sizeVisibleChunk - visibleChunk;

        if (lack > 0) {
            return diffX + lack;
        }
        return diffX;
    },

    __checkRightContainment(diffX) {
        const offsetLeft = diffX + this.dragContext.startOffsetLeft;
        const widthExcess = offsetLeft + sizeVisibleChunk - document.body.offsetWidth;

        if (widthExcess > 0) {
            return diffX - widthExcess;
        }
        return diffX;
    },

    __onResize() {
        if (this.isDestroyed()) {
            return;
        }
        this.__checkPosition();
    },

    isNeedToPrevent() {
        return document.querySelector('.dev-codemirror-maximized') !== null || document.querySelector('.CodeMirror-hints') !== null;
    },

    setLoading(loading: boolean) {
        if (!this.isDestroyed()) {
            this.loading.setLoading(loading);
        }
    }
});
