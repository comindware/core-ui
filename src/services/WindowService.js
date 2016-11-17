/**
 * Developer: Stepan Burguchev
 * Date: 7/6/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { $ } from '../libApi';
import PopupStackView from './window/views/PopupStackView';

var windowService = /** @lends module:core.services.WindowService */ {
    initialize () {
        this.__$popupStackRegionEl = $(document.createElement('div'));
        this.__$popupStackRegionEl.appendTo(document.body);

        let regionManager = new Marionette.RegionManager();
        regionManager.addRegion('popupStackRegion', { el: this.__$popupStackRegionEl });

        let popupStackRegion = regionManager.get('popupStackRegion');
        this.__popupStackView = new PopupStackView();
        popupStackRegion.show(this.__popupStackView);
    },

    /**
     * Shows a marionette.view as a popup. If another popup is already shown, overlaps it.
     * The size of the view and it's location is totally the view's responsibility.
     * @param {Marionette.View} view A Marionette.View instance to show.
     * @returns {String} The popup id that you can use to close it.
     * */
    showPopup (view) {
        this.__popupStackView.showPopup(view, {
            fadeBackground: true,
            transient: false
        });
    },

    /**
     * Closes the top-level popup or does nothing if there is none.
     * @param {string} [popupId=null]
     * */
    closePopup (popupId = null) {
        this.__popupStackView.closePopup(popupId);
    },

    /**
     * Shows a marionette.view as a transient popup. If another popup is already shown, overlaps it.
     * The size of the view and it's location is totally the view's responsibility.
     * @param {Marionette.View} view A Marionette.View instance to show.
     * @param {Object} options Options object.
     * @param {Boolean} [options.fadeBackground=true] Whether to fade the background behind the popup.
     * */
    showTransientPopup (view, options = { fadeBackground: false }) {
        return this.__popupStackView.showPopup(view, {
            fadeBackground: options.fadeBackground,
            anchorEl: options.anchorEl,
            transient: true
        });
    },

    fadeBackground (fade) {
        this.__popupStackView.fadeBackground(fade);
    }
};

_.extend(windowService, Backbone.Events);

export default windowService;
