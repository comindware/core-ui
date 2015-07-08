/**
 * Developer: Stepan Burguchev
 * Date: 7/6/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
        'module/lib',
        'core/utils/utilsApi',
        'core/application/views/FadingPanelView'
    ],
    function (lib, utilsApi, FadingPanelView) {
        'use strict';

        var state = {};

        return {
            initialize: function (options) {
                utilsApi.helpers.ensureOption(options, 'fadingRegion');
                utilsApi.helpers.ensureOption(options, 'popupRegion');

                state.options = options;
                state.fadingRegion = options.fadingRegion;
                state.popupRegion = options.popupRegion;

                state.fadingPanelView = new FadingPanelView();
                state.fadingRegion.show(state.fadingPanelView);
            },

            showPopup: function (view, options) {
                this.fadeIn(options);
                state.popupRegion.show(view);
            },

            closePopup: function () {
                this.fadeOut();
                state.popupRegion.reset();
            },

            fadeIn: function (options) {
                state.fadingPanelView.fadeIn(options);
            },

            fadeOut: function () {
                state.fadingPanelView.fadeOut();
            }
        };
    });
