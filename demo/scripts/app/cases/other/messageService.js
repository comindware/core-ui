define(['comindware/core'],
    function (core) {
        'use strict';

        return function () {

            // Show Confirmation dialog
            var showConfirm = function () {
                var description = 'Confirm Message';

                core.services.MessageService.confirm(description).then(function (result) {
                    // Handle user response: result true or false
                });
            };

            // Show 'Ask Yes/No' dialog
            var showAskYesNo = function () {
                var description = 'Message question',
                    text = 'Question';

                core.services.MessageService.askYesNo(description, text).then(function (result) {
                    // Handle user response: result true or false
                });
            };

            // Show Error dialog
            var showError = function () {
                var description = 'Error message',
                    text = 'Error';

                core.services.MessageService.error(description, text).then(function () {
                    // Handle user response
                });
            };

            // Show Custom Message dialog
            var showCustomMessageDialog = function () {
                var description = 'Message description',
                    text = 'Title';

                core.services.MessageService.showMessageDialog(
                    text,
                    description,
                    [ // Array of buttons
                        { id: 'buttonId', text: 'Ok' }
                    ]
                ).then(function (result) {
                    // Handle user response: result is id of the pressed button
                });
            };

            var View = Marionette.ItemView.extend({
                template: Handlebars.compile('<input class="js-confirm__button message-service__button" type="button" value="Show Confirm">' +
                                             '<input class="js-yes-no__button message-service__button" type="button" value="Show Ask Yes/No">' +
                                             '<input class="js-error__button message-service__button" type="button" value="Show Error">' +
                                             '<input class="js-message-dialog__button message-service__button" type="button" value="Show Custom Message Dialog">'),
                ui: {
                    'showConfirm': '.js-confirm__button',
                    'showAskYesNo': '.js-yes-no__button',
                    'showError': '.js-error__button',
                    'showMessageDialog': '.js-message-dialog__button'
                },
                events: {
                    'click @ui.showConfirm': showConfirm,
                    'click @ui.showAskYesNo': showAskYesNo,
                    'click @ui.showError': showError,
                    'click @ui.showMessageDialog': showCustomMessageDialog
                }
            });

            return new View();
        };
    });
