define(['comindware/core'],
    function (core) {
        'use strict';
        return function () {
            var PopupView = Marionette.ItemView.extend({
                initialize: function (options) {
                    this.index = (options && options.index) || 0;
                },

                template: Handlebars.compile('<div class="msg-popup__desc">Your popup message {{index}}</div> <input class="js-open__button msg-popup__button_default msg-popup__button" style="margin-left:140px;" type="button" value="Show popup" /> <input class="js-close__button msg-popup__button_default msg-popup__button" style="margin-right:10px;" type="button" value="Close" />'),

                templateHelpers: function () {
                    return {
                        index: this.index
                    };
                },

                className: 'demo-popup',

                ui: {
                    'btnClose': '.js-close__button',
                    'btnOpen': '.js-open__button'
                },

                events: {
                    'click @ui.btnClose': '__closePopup',
                    'click @ui.btnOpen': '__showPopup'
                },

                __closePopup: function () {
                    core.services.WindowService.closePopup();
                },

                __showPopup: function () {
                    var popupView = new PopupView({
                        index: this.index + 1 || 1
                    });
                    core.services.WindowService.showPopup(popupView);
                }
            });

            var View = Marionette.ItemView.extend({
                template: Handlebars.compile('<input class="js-show__button" type="button" value="Show Popup"/>'),

                ui: {
                    btnTest: '.js-show__button'
                },

                events: {
                    'click @ui.btnTest': '__showPopup'
                },

                __showPopup: function (e) {
                    var popupView = new PopupView();
                    core.services.WindowService.showTransientPopup(popupView, {
                        anchorEl: e.target
                    });
                }
            });

            return new View();
        };
    });
