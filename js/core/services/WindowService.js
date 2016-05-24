/**
 * Developer: Stepan Burguchev
 * Date: 7/6/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import { helpers } from '../utils/utilsApi';
import FadingPanelView from '../views/FadingPanelView';

let self = {};

let classes = {
    HIDDEN: 'hidden'
};

let windowService = {
    initialize: function (options) {
        helpers.ensureOption(options, 'fadingRegion');
        helpers.ensureOption(options, 'popupRegion');
        helpers.ensureOption(options, 'ui');

        self.options = options;
        self.fadingRegion = options.fadingRegion;
        self.popupRegion = options.popupRegion;
        self.ui = options.ui;

        self.fadingPanelView = new FadingPanelView();
        self.fadingRegion.show(self.fadingPanelView);
        this.listenTo(self.fadingPanelView, 'click', this.__onFadingPanelClick);
    },

    showPopup: function (view, options) {
        this.fadeIn({
            fadeOut: false
        });
        self.ui.popupRegion.removeClass(classes.HIDDEN);
        self.popupRegion.show(view);
    },

    closePopup: function () {
        this.fadeOut();
        self.popupRegion.reset();
        self.ui.popupRegion.addClass(classes.HIDDEN);
    },

    fadeIn: function (options) {
        self.ui.fadingRegion.removeClass(classes.HIDDEN);
        self.fadingPanelView.fadeIn(options);
    },

    fadeOut: function () {
        self.fadingPanelView.fadeOut();
        self.ui.fadingRegion.addClass(classes.HIDDEN);
        this.trigger('fadeOut');
    },

    __onFadingPanelClick: function (view, options) {
        if (!options || options.fadeOut !== false) {
            this.fadeOut();
        }
    }
};

_.extend(windowService, Backbone.Events);

export default windowService;
