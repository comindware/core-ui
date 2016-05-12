/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';
import { helpers } from '../../utils/utilsApi';
import template from '../templates/dropdown.hbs';

const classes = {
    OPEN: 'open',
    DROPDOWN_DOWN: 'dropdown__wrp_down',
    DROPDOWN_WRP_OVER: 'dropdown__wrp_over',
    DROPDOWN_UP: 'dropdown__wrp_up',
    DROPDOWN_UP_OVER: 'dev-panel-up-over'
};

const panelPosition = {
    DOWN: 'down',
    DOWN_OVER: 'down-over',
    UP: 'up',
    UP_OVER: 'up-over'
};

const defaultOptions = {
    autoOpen: true,
    renderAfterClose: true,
    panelPosition: panelPosition.DOWN
};

/**
 * @name DropdownView
 * @memberof module:core.dropdown.views
 * @class Composite View that implements dropdown logic similar to SELECT HTML-element.
 * Unlike {@link module:core.dropdown.views.PopoutView PopoutView}, a panel doesn't have a speech bubble triangle and
 * it's min-width is always determined and equal to the width of a button view.
 *
 * A dropdown view contains button and panel regions that can be fully customizable by the properties <code>buttonView</code> and <code>panelView</code>.
 * <ul>
 * <li>Button View is used for displaying a button. Click on that button trigger a panel to open.</li>
 * <li>Panel View is used to display a panel that drops down.</li>
 * </ul>
 *
 * Panel width is determined by its layout but it cannot be less than the button's width. Panel height is fully determined by its layout.
 * A place where the panel appears depends on the <code>panelPosition</code> option.<br/>
 * Possible events:<ul>
 * <li><code>'open' (dropdownView)</code> - fires after the panel has opened.</li>
 * <li><code>'close' (dropdownView, ...)</code> - fires after the panel has closed.
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
 * @param {String} [options.panelPosition='down'] Opening direction:
 *       <ul><li><code>'down'</code> - opens down.</li>
 *       <li><code>'down-over'</code> - opens down and the panel is located above the button overlapping it.</li>
 *       <li><code>'up'</code> - opens up.</li>
 *       <li><code>'up-over'</code> - opens up and the panel is located above the button overlapping it.</li></ul>
 * @param {Boolean} [options.renderAfterClose=true] Whether to trigger button render when the panel has closed.
 * */

export default Marionette.LayoutView.extend(/** @lends module:core.dropdown.views.DropdownView.prototype */ {
    initialize: function (options) {
        _.extend(this.options, _.clone(defaultOptions), options || {});
        helpers.ensureOption(options, 'buttonView');
        helpers.ensureOption(options, 'panelView');
        _.bindAll(this, 'open', 'close', '__handleBlur');
    },

    template: template,

    className: 'dropdown',

    regions: {
        buttonRegion: '.js-button-region',
        panelRegion: '.js-panel-region'
    },

    ui: {
        button: '.js-button-region',
        panel: '.js-panel-region'
    },

    events: {
        'click @ui.button': '__handleClick',
        'blur @ui.panel': '__handleBlur'
    },

    /**
     * Contains an instance of <code>options.buttonView</code> if the dropdown is rendered, <code>null</code> otherwise.
     * */
    buttonView: null,

    /**
     * Contains an instance of <code>options.panelView</code> if the dropdown is open, <code>null</code> otherwise.
     * The view is created every time (!) the panel is triggered to open.
     * */
    panelView: null,

    onRender: function () {
        if (this.button) {
            this.stopListening(this.button);
        }
        this.button = new this.options.buttonView(_.extend({ parent: this }, _.result(this.options, 'buttonViewOptions')));
        this.buttonView = this.button;
        this.listenTo(this.button, 'all', function() {
            var args = Array.prototype.slice.call(arguments);
            args[0] = 'button:' + args[0];
            this.triggerMethod.apply(this, args);
        });
        this.buttonRegion.show(this.button);

        this.currentPosition = this.options.panelPosition;
        this.updatePositionClasses();
    },

    updatePositionClasses: function () {
        if (this.currentPosition === panelPosition.DOWN) {
            this.ui.panel.removeClass(classes.DROPDOWN_WRP_OVER)
                .removeClass(classes.DROPDOWN_UP)
                .removeClass(classes.DROPDOWN_UP_OVER);

            this.ui.panel.addClass(classes.DROPDOWN_DOWN);
        } else if (this.currentPosition === panelPosition.DOWN_OVER) {
            this.ui.panel.removeClass(classes.DROPDOWN_DOWN)
                .removeClass(classes.DROPDOWN_UP)
                .removeClass(classes.DROPDOWN_UP_OVER);

            this.ui.panel.addClass(classes.DROPDOWN_WRP_OVER);
        } else if (this.currentPosition === panelPosition.UP) {
            this.ui.panel.removeClass(classes.DROPDOWN_WRP_OVER)
                .removeClass(classes.DROPDOWN_DOWN)
                .removeClass(classes.DROPDOWN_UP_OVER);

            this.ui.panel.addClass(classes.DROPDOWN_UP);
        } else if (this.currentPosition === panelPosition.UP_OVER) {
            this.ui.panel.removeClass(classes.DROPDOWN_WRP_OVER)
                .removeClass(classes.DROPDOWN_UP)
                .removeClass(classes.DROPDOWN_DOWN);

            this.ui.panel.addClass(classes.DROPDOWN_UP_OVER);
        }
    },

    correctPosition: function () {
        let buttonHeight = this.buttonRegion.$el.height(),
            panelHeight = this.panelRegion.$el.height(),
            viewportHeight = window.innerHeight,
            buttonTopOffset = this.buttonRegion.$el.offset().top,
            buttonBottomOffset = viewportHeight - buttonTopOffset - buttonHeight;

        if (this.currentPosition === panelPosition.UP && buttonTopOffset < panelHeight) {
            this.currentPosition = panelPosition.DOWN;
        }
        
        if (this.currentPosition === panelPosition.UP_OVER && buttonTopOffset + buttonHeight < panelHeight) {
            this.currentPosition = panelPosition.DOWN_OVER;
        }
        
        if (this.currentPosition === panelPosition.DOWN && buttonBottomOffset < panelHeight) {
            this.currentPosition = panelPosition.UP;
        }
            
        if (this.currentPosition === panelPosition.DOWN_OVER && buttonBottomOffset + buttonHeight < panelHeight) {
            this.currentPosition = panelPosition.UP_OVER;
        }
        
        this.updatePositionClasses();
        
        switch (this.currentPosition) {
            case panelPosition.UP:
                this.panelRegion.$el.css({
                    top: -panelHeight
                });
                break;
            case panelPosition.UP_OVER:
                this.panelRegion.$el.css({
                    top: buttonHeight - panelHeight
                });
                break;
            case panelPosition.DOWN:
                this.panelRegion.$el.css({
                    top: buttonHeight
                });
                break;
            case panelPosition.DOWN_OVER:
                this.panelRegion.$el.css({
                    top: 0
                });
                break;
        }
    },

    /**
     * Opens the dropdown panel.
     * */
    open: function () {
        if (this.isOpen) {
            return;
        }
        var panelViewOptions = _.extend(_.result(this.options, 'panelViewOptions') || {}, {
            parent: this
        });

        this.$el.addClass(classes.OPEN);
        this.ui.panel.css('display', 'block');
        if (this.panelView) {
            this.stopListening(this.panelView);
        }
        this.panelView = new this.options.panelView(panelViewOptions);
        this.listenTo(this.panelView, 'all', function() {
            var args = Array.prototype.slice.call(arguments);
            args[0] = 'panel:' + args[0];
            this.triggerMethod.apply(this, args);
        });

        this.panelRegion.show(this.panelView);
        this.correctPosition();

        if ($.contains(this.el, document.activeElement)) {
            $(document.activeElement).one('blur', this.__handleBlur);
        } else {
            this.ui.panel.focus();
        }
        //noinspection JSValidateTypes
        this.isOpen = true;
        this.trigger('open', this);
    },

    /**
     * Closes the dropdown panel.
     * @param {...*} arguments Arguments transferred into the <code>'close'</code> event.
     * */
    close: function () {
        if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
            return;
        }

        // selecting focusable parent after closing is important to maintant nested dropdowns
        // focused element MUST be changed BEFORE active element is hidden or destroyed (!)
        var firstFocusableParent = this.ui.panel.parents().filter(':focusable')[0];
        if (firstFocusableParent) {
            $(firstFocusableParent).focus();
        }

        var closeArgs = _.toArray(arguments);
        this.ui.panel.hide({
            duration: 0,
            complete: function () {
                this.$el.removeClass(classes.OPEN);
                this.panelRegion.reset();
                //noinspection JSValidateTypes
                this.isOpen = false;

                this.trigger.apply(this, [ 'close', this ].concat(closeArgs));
                if (this.options.renderAfterClose) {
                    this.render();
                }
            }.bind(this)
        });
    },

    __handleClick: function () {
        if (this.options.autoOpen) {
            this.open();
        }
    },

    __handleBlur: function () {
        setTimeout(function () {
            if ($.contains(this.el, document.activeElement)) {
                $(document.activeElement).one('blur', this.__handleBlur);
            } else {
                this.close();
            }
        }.bind(this), 15);
    }
});
