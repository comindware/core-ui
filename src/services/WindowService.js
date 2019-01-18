import PopupStackView from './window/views/PopupStackView';
import GlobalEventService from './GlobalEventService';

export default {
    initialize() {
        Object.assign(this, Backbone.Events);

        const __popupStackRegionEl = document.createElement('div');

        document.body.appendChild(__popupStackRegionEl);

        const rootView = window.app.getView();

        rootView.addRegion('popupStackRegion', {
            el: __popupStackRegionEl,
            replaceElement: true
        });

        this.__popupStackView = new PopupStackView();

        rootView.showChildView('popupStackRegion', this.__popupStackView);

        this.__popupStackView.on('popup:close', popupId => this.trigger('popup:close', popupId));
        this.listenTo(GlobalEventService, 'window:keydown:captured', (document, event) => this.__keyAction(event));
    },

    /**
     * Shows a marionette.view as a popup. If another popup is already shown, overlaps it.
     * The size of the view and it's location is totally the view's responsibility.
     * @param {Marionette.View} view A Marionette.View instance to show.
     * @returns {String} The popup id that you can use to close it.
     * */
    showPopup(view) {
        return this.__popupStackView.showPopup(view, {
            fadeBackground: true,
            transient: false,
            hostEl: null
        });
    },

    /**
     * Closes the top-level popup or does nothing if there is none.
     * @param {string} [popupId=null]
     * */
    closePopup(popupId = null) {
        this.__popupStackView && this.__popupStackView.closePopup(popupId);
    },

    /**
     * Shows a marionette.view as a transient popup. If another popup is already shown, overlaps it.
     * The size of the view and it's location is totally the view's responsibility.
     * @param {Marionette.View} view A Marionette.View instance to show.
     * @param {Object} options Options object.
     * @param {Boolean} [options.fadeBackground=true] Whether to fade the background behind the popup.
     * */
    showTransientPopup(view, options = { fadeBackground: false, hostEl: null }) {
        return this.__popupStackView.showPopup(view, {
            fadeBackground: options.fadeBackground,
            anchorEl: options.anchorEl,
            transient: true,
            hostEl: options.hostEl
        });
    },

    get(popupId) {
        return this.__popupStackView.get(popupId);
    },

    isPopupOpen() {
        const stack = this.__popupStackView.getStack();
        return stack.length > 0;
    },

    fadeBackground(fade) {
        this.__popupStackView.fadeBackground(fade);
    },

    isPopupOnTop(popupId) {
        return this.__popupStackView.isPopupOnTop(popupId);
    },

    __keyAction(event) {
        if (event.keyCode === 27) {
            this.__popupStackView.closeTopPopup();
        }
    }
};
