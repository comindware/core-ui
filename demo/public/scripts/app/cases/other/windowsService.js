define(['comindware/core'],
    function (core) {
        'use strict';
        return function () {
            // Create popup width close button
            var PopupView = Marionette.ItemView.extend({
                template: Handlebars.compile('<div class="msg-popup__desc">Your popup message</div> <input class="js-close__button msg-popup__button_default msg-popup__button" style="margin-left:300px;" type="button" value="Close" />'),

                className: 'demo-popup',

                ui: {
                    'btnClose': '.js-close__button'
                },

                events: {
                  'click @ui.btnClose': '__closePopup'
                },

            // Declare close popup method
                __closePopup: function () {
                    core.services.WindowService.closePopup();
                }
            });

            // Create show popup button view
            var View = Marionette.ItemView.extend({
                template: Handlebars.compile('<input class="js-show__button" type="button" value="Show Popup"/>'),

                ui: {
                    btnTest: '.js-show__button'
                },

                events: {
                    'click @ui.btnTest': '__showPopup'
                },

                //Declare show popup method
                __showPopup: function () {
                    var popupView = new PopupView();
                    core.services.WindowService.showPopup(popupView);
                }
            });

            return new View();
        };
    });
