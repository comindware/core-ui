
export default function() {
    var PopupView = Marionette.View.extend({
        initialize(options) {
            this.index = (options && options.index) || 1;
        },

        template: Handlebars.compile(
            '<div class="msg-popup__desc">Your popup message {{index}}</div> ' +
            '<input class="js-open__button msg-popup__button_default msg-popup__button" style="margin-left:140px;" type="button" value="Show popup" /> ' +
            '<input class="js-close__button msg-popup__button_default msg-popup__button" style="margin-right:10px;" type="button" value="Close" />'),

        templateContext() {
            return {
                index: this.index
            };
        },

        className: 'demo-popup',

        events: {
            'click .js-close__button': '__closePopup',
            'click .js-open__button': '__showPopup'
        },

        __closePopup() {
            Core.services.WindowService.closePopup();
        },

        __showPopup() {
            Core.services.WindowService.showPopup(new PopupView({
                index: this.index + 1 || 1
            }));
        }
    });

    const View = Marionette.View.extend({
        template: Handlebars.compile('<input class="js-show__button" type="button" value="Show Popup"/>'),

        events: {
            'click .js-show__button': '__showPopup'
        },

        __showPopup() {
            Core.services.WindowService.showPopup(new PopupView());
        }
    });

    return new View();
}
