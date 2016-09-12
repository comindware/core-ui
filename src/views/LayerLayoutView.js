/**
 * Developer: Ksenia Kartvelishvili
 * Date: 9/9/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import FadingPanelView from '../views/FadingPanelView';
import template from '../templates/layerLayout.hbs';

let classes = {
    HIDDEN: 'hidden',
    POPUP_REGION: 'js-popup-region-'
};

export default Marionette.LayoutView.extend({
    initialize: function () {
        this.popupNumber = 0;
    },

    template: template,

    onRender: function () {
        this.fadingPanelView = new FadingPanelView();
        this.fadingPopupRegion.show(this.fadingPanelView);
        this.listenTo(this.fadingPanelView, 'click', this.__onFadingPanelClick);
    },

    regions: {
        fadingPopupRegion: '.js-fading-popup-region'
    },

    ui: {
        fadingPopupRegion: '.js-fading-popup-region'
    },

    showPopup: function (view) {
        if (this.popupNumber === 0) {
            this.fadeIn({
                fadeOut: false
            });
        }
        var className = classes.POPUP_REGION + this.popupNumber;
        this.$el.append($('<div></div>').addClass(className));
        this.addRegion(className, '.' + className);
        this.getRegion(className).show(view);
        this.popupNumber++;
    },

    closePopup: function () {
        if (this.popupNumber <= 0) {
            return;
        }
        this.popupNumber--;
        if (this.popupNumber === 0) {
            this.fadeOut();
        }
        var className = classes.POPUP_REGION + this.popupNumber;
        this.removeRegion(className);
        this.$el.find('.' + className).remove();
    },

    fadeIn: function (options) {
        this.ui.fadingPopupRegion.removeClass(classes.HIDDEN);
        this.fadingPanelView.fadeIn(options);
    },

    fadeOut: function () {
        this.fadingPanelView.fadeOut();
        this.ui.fadingPopupRegion.addClass(classes.HIDDEN);
    },

    __onFadingPanelClick: function (view, options) {
        if (!options || options.fadeOut !== false) {
            this.fadeOut();
        }
    }
});