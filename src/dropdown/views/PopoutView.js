/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { $, Handlebars } from 'lib';
import { helpers } from 'utils';
import WindowService from '../../services/WindowService';
import GlobalEventService from '../../services/GlobalEventService';
import BlurableBehavior from '../utils/BlurableBehavior';

import ListenToElementMoveBehavior from '../utils/ListenToElementMoveBehavior';
import template from '../templates/popout.hbs';
import WrapperView from './WrapperView';

const WINDOW_BORDER_OFFSET = 10;

const classes = {
    OPEN: 'open',
    DIRECTION_UP: 'popout__up',
    DIRECTION_DOWN: 'popout__down',
    FLOW_LEFT: 'popout__flow-left',
    FLOW_RIGHT: 'popout__flow-right',
    CUSTOM_ANCHOR_BUTTON: 'popout__action-btn',
    DEFAULT_ANCHOR_BUTTON: 'popout__action',
    DEFAULT_ANCHOR: 'anchor'
};

const popoutFlow = {
    LEFT: 'left',
    RIGHT: 'right'
};

const popoutDirection = {
    UP: 'up',
    DOWN: 'down'
};

const height = {
    AUTO: 'auto',
    BOTTOM: 'bottom'
};

const defaultOptions = {
    popoutFlow: popoutFlow.LEFT,
    customAnchor: false,
    fade: false,
    height: 'auto',
    autoOpen: true,
    direction: popoutDirection.DOWN,
    renderAfterClose: true
};

/**
 * @name PopoutView
 * @memberof module:core.dropdown.views
 * @class Composite View that may be to display a dropdown panel as a speech bubble. Unlike {@link module:core.dropdown.views.DropdownView DropdownView},
 * the panel is displayed in speech bubble and has a triangle like in comics.
 * A dropdown view contains button and panel regions that can be fully customizable by the properties <code>buttonView</code> and <code>panelView</code>.
 * <ul>
 * <li>Button View is used for displaying a button. Click on that button trigger a panel to open.</li>
 * <li>Panel View is used to display a panel that drops down.</li>
 * </ul>
 * Panel width is fully determined by its layout and the <code>popoutFlow</code> option.
 * Panel height is determined by its layout and the <code>height</code> option.
 * A place where the panel appears depends on the <code>direction</code> and <code>popoutFlow</code> options.<br/>
 * Possible events:<ul>
 * <li><code>'before:open' (popoutView)</code> - fires before the panel has opened.</li>
 * <li><code>'open' (popoutView)</code> - fires after the panel has opened.</li>
 * <li><code>'before:close' (popoutView)</code> - fires before the panel has closed.</li>
 * <li><code>'close' (popoutView, ...)</code> - fires after the panel has closed.
 * If the panel was closed via <code>close(...)</code> method, the arguments of this method are transferred into this event.</li>
 * <li><code>'button:\*' </code> - all events the buttonView triggers are repeated by this view with 'button:' prefix.</li>
 * <li><code>'panel:\*' </code> - all events the panelView triggers are repeated by this view with 'panel:' prefix.</li>
 * </ul>
 * @constructor
 * @extends Marionette.LayoutView
 * @param {Object} options Options object.
 * @param {Marionette.View} options.buttonView View class for displaying the button.
 * @param {(Object|Function)} [options.buttonViewOptions] Options passed into the view on its creation.
 * @param {Marionette.View} options.panelView View class for displaying the panel. The view is created every time the panel is triggered to open.
 * @param {(Object|Function)} [options.panelViewOptions] Options passed into the view on its creation.
 * @param {Boolean} [options.autoOpen=true] Whether click on the button should trigger the panel to open.
 * @param {Boolean} [options.customAnchor=false] Whether to attach the speech bubble triangle (anchor) to a custom element in <code>buttonView</code>.
 *                                               The View passed into the <code>buttonView</code> option must implement
 *                                               @{link module:core.dropdown.views.behaviors.CustomAnchorBehavior CustomAnchorBehavior}.
 * @param {String} [options.direction='down'] Opening direction. Can be either: <code>'up'</code>, <code>'down'</code>.
 * @param {Boolean} [options.fade=false] Whether to dim the background when the panel is open.
 * @param {String} [options.height='auto'] A way of determining the panel height.
 *                                       <ul><li><code>'auto'</code> - is determined by panel's layout only.</li>
 *                                       <li><code>'bottom'</code> - the bottom border is fixed to the bottom of the window.</li></ul>
 * @param {String} [options.popoutFlow='left'] Panel's horizontal position.
 *                                       <ul><li><code>'left'</code> - The left border of the panel is attached to the left border of the button.
 *                                       The panel grows to the right.</li>
 *                                       <li><code>'right'</code> - The right border of the panel is attached to the right border of the button.
 *                                       The panel grows to the left.</li></ul>
 * @param {Boolean} [options.renderAfterClose=true] Whether to trigger button render when the panel has closed.
 * */

export default Marionette.LayoutView.extend(/** @lends module:core.dropdown.views.PopoutView.prototype */ {
    initialize(options) {
        _.defaults(this.options, defaultOptions);
        helpers.ensureOption(options, 'buttonView');
        helpers.ensureOption(options, 'panelView');
        _.bindAll(this, 'open', 'close');

        this.listenTo(WindowService, 'popup:close', this.__onWindowServicePopupClose);
    },

    template: Handlebars.compile(template),

    behaviors: {
        BlurableBehavior: {
            behaviorClass: BlurableBehavior,
            onBlur: '__handleBlur'
        },
        ListenToElementMoveBehavior: {
            behaviorClass: ListenToElementMoveBehavior
        }
    },

    className: 'popout',

    regions: {
        buttonRegion: '.js-button-region'
    },

    ui: {
        button: '.js-button-region'
    },

    events: {
        'click @ui.button': '__handleClick'
    },

    /**
     * Contains an instance of <code>options.buttonView</code> if the popout is rendered, <code>null</code> otherwise.
     * */
    buttonView: null,

    /**
     * Contains an instance of <code>options.panelView</code> if the popout is open, <code>null</code> otherwise.
     * The view is created every time (!) the panel is triggered to open.
     * */
    panelView: null,

    onRender() {
        this.isOpen = false;
        if (this.button) {
            this.stopListening(this.button);
        }
        this.button = new this.options.buttonView(_.result(this.options, 'buttonViewOptions'));
        this.buttonView = this.button;
        this.listenTo(this.button, 'all', (...args) => {
            args[0] = `button:${args[0]}`;
            this.triggerMethod(...args);
        });
        this.buttonRegion.show(this.button);

        if (!this.options.customAnchor) {
            this.buttonRegion.$el.append(`<span class="js-default-anchor ${classes.DEFAULT_ANCHOR}"></span>`);
        }

        this.ui.button.toggleClass(classes.CUSTOM_ANCHOR_BUTTON, this.options.customAnchor);
        this.ui.button.toggleClass(classes.DEFAULT_ANCHOR_BUTTON, !this.options.customAnchor);
    },

    onDestroy() {
        if (this.isOpen) {
            WindowService.closePopup(this.popupId);
        }
    },

    __getAnchorEl() {
        let $anchorEl = this.ui.button;
        if (this.options.customAnchor && this.button.$anchor) {
            $anchorEl = this.button.$anchor;
        } else {
            const defaultAnchor = this.ui.button.find('.js-default-anchor');
            if (defaultAnchor && defaultAnchor.length) {
                $anchorEl = defaultAnchor;
            }
        }
        return $anchorEl;
    },

    __adjustFlowPosition($panelEl) {
        const $buttonEl = this.ui.button;
        const $anchorEl = this.__getAnchorEl();
        const viewport = {
            height: window.innerHeight,
            width: window.innerWidth
        };
        const anchorRect = $anchorEl.offset();
        anchorRect.height = $anchorEl.outerHeight();
        anchorRect.width = $anchorEl.outerWidth();
        anchorRect.bottom = viewport.height - anchorRect.top - anchorRect.height;
        const buttonRect = $buttonEl.offset();
        buttonRect.width = $buttonEl.outerWidth();
        const panelRect = $panelEl.offset();
        panelRect.width = $panelEl.outerWidth();

        const css = {
            left: '',
            right: ''
        };
        switch (this.options.popoutFlow) {
            case popoutFlow.RIGHT: {
                const leftCenter = anchorRect.left + anchorRect.width / 2;
                if (leftCenter < WINDOW_BORDER_OFFSET) {
                    css.left = WINDOW_BORDER_OFFSET;
                } else if (leftCenter + panelRect.width > viewport.width - WINDOW_BORDER_OFFSET) {
                    css.left = viewport.width - WINDOW_BORDER_OFFSET - panelRect.width;
                } else {
                    css.left = leftCenter;
                }
                break;
            }
            case popoutFlow.LEFT: {
                const anchorRightCenter = viewport.width - (anchorRect.left + anchorRect.width / 2);
                if (anchorRightCenter < WINDOW_BORDER_OFFSET) {
                    css.right = WINDOW_BORDER_OFFSET;
                } else if (anchorRightCenter + panelRect.width > viewport.width - WINDOW_BORDER_OFFSET) {
                    css.right = viewport.width - WINDOW_BORDER_OFFSET - panelRect.width;
                } else {
                    css.right = anchorRightCenter;
                }
                break;
            }
            default:
                break;
        }

        $panelEl.toggleClass(classes.FLOW_LEFT, this.options.popoutFlow === popoutFlow.LEFT);
        $panelEl.toggleClass(classes.FLOW_RIGHT, this.options.popoutFlow === popoutFlow.RIGHT);

        $panelEl.css(css);
    },

    __adjustDirectionPosition($panelEl) {
        const $anchorEl = this.__getAnchorEl();
        const viewport = {
            height: window.innerHeight,
            width: window.innerWidth
        };
        const anchorRect = $anchorEl.offset();
        anchorRect.height = $anchorEl.outerHeight();
        anchorRect.width = $anchorEl.outerWidth();
        anchorRect.bottom = viewport.height - anchorRect.top - anchorRect.height;
        const panelRect = $panelEl.offset();
        panelRect.height = $panelEl.outerHeight();

        let direction = this.options.direction;

        // switching direction if there is not enough space
        switch (direction) {
            case popoutDirection.UP:
                if (anchorRect.top < panelRect.height && anchorRect.bottom > anchorRect.top) {
                    direction = popoutDirection.DOWN;
                }
                break;
            case popoutDirection.DOWN:
                if (anchorRect.bottom < panelRect.height && anchorRect.top > anchorRect.bottom) {
                    direction = popoutDirection.UP;
                }
                break;
            default:
                break;
        }

        // class adjustments
        $panelEl.toggleClass(classes.DIRECTION_UP, direction === popoutDirection.UP);
        $panelEl.toggleClass(classes.DIRECTION_DOWN, direction === popoutDirection.DOWN);

        // panel positioning
        let top;
        switch (direction) {
            case popoutDirection.UP:
                top = anchorRect.top - panelRect.height;
                break;
            case popoutDirection.DOWN:
                top = anchorRect.top + anchorRect.height;
                break;
            default:
                break;
        }

        // trying to fit into viewport
        if (top + panelRect.height > viewport.height - WINDOW_BORDER_OFFSET) {
            top = viewport.height - WINDOW_BORDER_OFFSET - panelRect.height;
        }
        if (top <= WINDOW_BORDER_OFFSET) {
            top = WINDOW_BORDER_OFFSET;
        }

        const css = {
            top,
            bottom: ''
        };
        if (this.options.height === height.BOTTOM) {
            css.bottom = WINDOW_BORDER_OFFSET;
        }
        $panelEl.css(css);
    },

    __handleClick() {
        if (this.options.autoOpen) {
            this.open();
        }
    },

    __isNestedInButton(testedEl) {
        return this.el === testedEl || $.contains(this.el, testedEl);
    },

    __isNestedInPanel(testedEl) {
        return WindowService.get(this.popupId).map(x => x.el).some(el => el === testedEl || $.contains(el, testedEl));
    },

    __handleBlur() {
        if (!this.__suppressHandlingBlur && !this.__isNestedInButton(document.activeElement) && !this.__isNestedInPanel(document.activeElement)) {
            this.close();
        }
    },

    __handleGlobalMousedown(target) {
        if (this.__isNestedInPanel(target)) {
            // clicking on panel result in focusing body and normally lead to closing the popup
            this.__suppressHandlingBlur = true;
        } else if (!this.__isNestedInButton(target)) {
            this.close();
        }
    },

    __onWindowServicePopupClose(popupId) {
        if (this.isOpen && this.popupId === popupId) {
            this.close();
        }
    },

    /**
     * Opens the dropdown panel.
     * */
    open() {
        if (this.isOpen) {
            return;
        }
        this.trigger('before:open', this);

        const panelViewOptions = _.extend(_.result(this.options, 'panelViewOptions') || {}, {
            parent: this
        });
        this.panelView = new this.options.panelView(panelViewOptions);
        this.panelView.on('all', (...args) => {
            args[0] = `panel:${args[0]}`;
            this.triggerMethod(...args);
        });
        this.$el.addClass(classes.OPEN);

        const wrapperView = new WrapperView({
            view: this.panelView,
            className: 'popout__wrp'
        });
        this.popupId = WindowService.showTransientPopup(wrapperView, {
            fadeBackground: this.options.fade,
            hostEl: this.el
        });
        this.__adjustDirectionPosition(wrapperView.$el);
        this.__adjustFlowPosition(wrapperView.$el);

        this.listenToElementMoveOnce(this.el, this.close);
        this.listenTo(GlobalEventService, 'window:mousedown:captured', this.__handleGlobalMousedown);
        const activeElement = document.activeElement;
        if (!this.__isNestedInButton(activeElement) && !this.__isNestedInPanel(activeElement)) {
            this.panelView.$el.focus();
        } else {
            this.focus(activeElement);
        }
        this.__suppressHandlingBlur = false;
        this.isOpen = true;
        this.trigger('open', this);
    },

    /**
     * Closes the dropdown panel.
     * @param {...*} arguments Arguments transferred into the <code>'close'</code> event.
     * */
    close(...args) {
        if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
            return;
        }
        this.trigger('before:close', this);
        this.$el.removeClass(classes.OPEN);

        WindowService.closePopup(this.popupId);

        this.isOpen = false;
        this.stopListeningToElementMove();
        this.stopListening(GlobalEventService);

        this.trigger('close', this, ...args);
        if (this.options.renderAfterClose) {
            this.render();
        }
    }
});
