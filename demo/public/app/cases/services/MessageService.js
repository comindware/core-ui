import core from 'comindware/core';

// Show Confirmation dialog
const showConfirm = function() {
    const description = 'Confirm Message';

    core.services.MessageService.confirm(description).then(result => {
        // Handle user response: result true or false
    });
};

// Show 'Ask Yes/No' dialog
const showAskYesNo = function() {
    let description = 'Message question',
        text = 'Question';

    core.services.MessageService.askYesNo(description, text).then(result => {
        // Handle user response: result true or false
    });
};

// Show Error dialog
const showError = function() {
    let description = 'Error message',
        text = 'Error';

    core.services.MessageService.error(description, text).then(() => {
        // Handle user response
    });
};

// Show Custom Message dialog
const showCustomMessageDialog = function() {
    let description = 'Message description',
        text = 'Title';

    core.services.MessageService.showMessageDialog(
        text,
        description,
        [ // Array of buttons
            { id: 'buttonId', text: 'Ok' }
        ]
    ).then(result => {
        // Handle user response: result is id of the pressed button
    });
};

const View = Marionette.ItemView.extend({
    template: Handlebars.compile('<input class="js-confirm__button message-service__button" type="button" value="Show Confirm">' +
        '<input class="js-yes-no__button message-service__button" type="button" value="Show Ask Yes/No">' +
        '<input class="js-error__button message-service__button" type="button" value="Show Error">' +
        '<input class="js-message-dialog__button message-service__button" type="button" value="Show Custom Message Dialog">'),
    ui: {
        showConfirm: '.js-confirm__button',
        showAskYesNo: '.js-yes-no__button',
        showError: '.js-error__button',
        showMessageDialog: '.js-message-dialog__button'
    },
    events: {
        'click @ui.showConfirm': showConfirm,
        'click @ui.showAskYesNo': showAskYesNo,
        'click @ui.showError': showError,
        'click @ui.showMessageDialog': showCustomMessageDialog
    }
});

export default new View();
