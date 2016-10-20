/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from '../../libApi';
import { helpers } from '../../utils/utilsApi';
import WindowService from '../../services/WindowService';
import BlurableBehavior from '../../views/behaviors/BlurableBehavior';
import template from '../templates/popout.hbs';

const slice = Array.prototype.slice;

const classes = {
    OPEN: 'open',
    DIRECTION_UP: 'popout__up',
    DIRECTION_DOWN: 'popout__down',
    FLOW_LEFT: 'popout__left',
    FLOW_RIGHT: 'popout__right',
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
    initialize: function (options) {
        _.defaults(this.options, defaultOptions);
        helpers.ensureOption(options, 'buttonView');
        helpers.ensureOption(options, 'panelView');
        _.bindAll(this, 'open', 'close', '__handleWindowResize');
    },

    template: Handlebars.compile(template),

    behaviors: {
        BlurableBehavior: {
            behaviorClass: BlurableBehavior,
            onBlur: 'close'
        }
    },

    className: 'popout',

    regions: {
        buttonRegion: '.js-button-region',
        panelRegion: '.js-panel-region'
    },

    ui: {
        button: '.js-button-region',
        panel: '.js-panel-region'
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

    onRender: function () {
        //noinspection JSValidateTypes
        this.isOpen = false;
        if (this.button) {
            this.stopListening(this.button);
        }
        this.button = new this.options.buttonView(_.result(this.options, 'buttonViewOptions'));
        this.buttonView = this.button;
        this.listenTo(this.button, 'all', function () {
            var args = slice.call(arguments);
            args[0] = 'button:' + args[0];
            this.triggerMethod.apply(this, args);
        });
        this.buttonRegion.show(this.button);

        if (!this.options.customAnchor) {
            this.buttonRegion.$el.append(`<span class="js-default-anchor ${classes.DEFAULT_ANCHOR}"></span>`);
        }

        if (this.options.popoutFlow === popoutFlow.LEFT) {
            this.ui.panel.addClass(classes.FLOW_LEFT);
            this.ui.panel.removeClass(classes.FLOW_RIGHT);
        } else {
            this.ui.panel.addClass(classes.FLOW_RIGHT);
            this.ui.panel.removeClass(classes.FLOW_LEFT);
        }
        if (this.options.customAnchor) {
            this.ui.button.addClass(classes.CUSTOM_ANCHOR_BUTTON);
        } else {
            this.ui.button.addClass(classes.DEFAULT_ANCHOR_BUTTON);
        }

        this.currentDirection = this.options.direction;
        this.updateDirectionClasses();
    },

    updatePanelFlow: function () {
        let isFlowRight = this.options.popoutFlow === popoutFlow.RIGHT,
            anchor = this.ui.button;

        if (this.options.customAnchor && this.button.$anchor) {
            anchor = this.button.$anchor;
        } else {
            let defaultAnchor = this.ui.button.find('.js-default-anchor');
            if (defaultAnchor && defaultAnchor.length) {
                anchor = defaultAnchor;
            }
        }

        if (isFlowRight) {
            this.panelRegion.$el.css({
                left: anchor.offset().left - this.ui.button.offset().left
            });
        } else {
            this.panelRegion.$el.css({
                right: (this.ui.button.offset().left + this.ui.button.width()) - (anchor.offset().left + anchor.width())
            });
        }
    },

    updateDirectionClasses: function () {
        if (this.currentDirection === popoutDirection.UP) {
            this.ui.button.addClass(classes.DIRECTION_UP);
            this.ui.button.removeClass(classes.DIRECTION_DOWN);

            if (this.panelRegion.$el) {
                this.panelRegion.$el.removeClass(classes.DIRECTION_DOWN);
                this.panelRegion.$el.addClass(classes.DIRECTION_UP);
            }
        } else {
            this.ui.button.addClass(classes.DIRECTION_DOWN);
            this.ui.button.removeClass(classes.DIRECTION_UP);

            if (this.panelRegion.$el) {
                this.panelRegion.$el.removeClass(classes.DIRECTION_UP);
                this.panelRegion.$el.addClass(classes.DIRECTION_DOWN);
            }
        }
    },

    __handleClick: function () {
        if (this.options.autoOpen) {
            this.open();
        }
    },

    /**
     * Opens the dropdown panel.
     * */
    open: function () {
        if (this.isOpen) {
            return;
        }
        this.trigger('before:open', this);

        var panelViewOptions = _.extend(_.result(this.options, 'panelViewOptions') || {}, {
            parent: this
        });
        if (this.panelView) {
            this.stopListening(this.panelView);
        }
        this.panelView = new this.options.panelView(panelViewOptions);
        this.listenTo(this.panelView, 'all', function () {
            var args = slice.call(arguments);
            args[0] = 'panel:' + args[0];
            this.triggerMethod.apply(this, args);
        });
        this.$el.addClass(classes.OPEN);
        if (this.options.fade) {
            WindowService.fadeIn();
        }
        this.ui.panel.show();
        this.panelRegion.show(this.panelView);
        this.correctDirection();
        this.updatePanelFlow();
        if (this.options.height === height.BOTTOM) {
            $(window).on('resize', this.__handleWindowResize);
            this.__handleWindowResize();
        }
        this.focus();
        //noinspection JSValidateTypes
        this.isOpen = true;
        this.trigger('open', this);
    },

    correctDirection: function () {
        let anchor = this.ui.button;

        if (this.options.customAnchor && this.button.$anchor) {
            anchor = this.button.$anchor;
        } else {
            let defaultAnchor = this.ui.button.find('.js-default-anchor');
            if (defaultAnchor && defaultAnchor.length) {
                anchor = defaultAnchor;
            }
        }
        
        let anchorHeight = anchor.height(),
            panelHeight = this.panelRegion.$el.height(),
            viewportHeight = window.innerHeight,
            anchorTopOffset = anchor.offset().top,
            anchorBottomOffset = viewportHeight - anchorTopOffset - anchorHeight,
            anchorButtonOffset = anchor.offset().top - this.ui.button.offset().top;
        
        if (this.currentDirection === popoutDirection.UP || anchorBottomOffset < panelHeight) {
            this.currentDirection = popoutDirection.UP;
            this.panelRegion.$el.css({
                top: anchorButtonOffset - panelHeight
            });
            this.updateDirectionClasses();
        }
        
        if (this.currentDirection === popoutDirection.DOWN || anchorTopOffset < panelHeight) {
            this.currentDirection = popoutDirection.DOWN;
            this.panelRegion.$el.css({
                top: anchorButtonOffset + anchorHeight
            });
            this.updateDirectionClasses();
        }
    },

    /**
     * Closes the dropdown panel.
     * @param {...*} arguments Arguments transferred into the <code>'close'</code> event.
     * */
    close: function () {
        if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
            return;
        }
        this.trigger('before:close', this);
        if (this.options.fade) {
            WindowService.fadeOut();
        }
        if (this.options.height === height.BOTTOM) {
            $(window).off('resize', this.__handleWindowResize);
        }

        var closeArgs = _.toArray(arguments);
        this.ui.panel.hide();
        this.$el.removeClass(classes.OPEN);
        this.panelRegion.reset();
        //noinspection JSValidateTypes
        this.isOpen = false;

        this.trigger.apply(this, [ 'close', this ].concat(closeArgs));
        if (this.options.renderAfterClose) {
            this.render();
        }
    },

    __handleWindowResize: function () {
        var outlineDiff = (this.panelView.$el.outerHeight() - this.panelView.$el.height());
        var panelHeight = $(window).height() - this.panelView.$el.offset().top - outlineDiff;
        this.panelView.$el.height(panelHeight);
    }
});
