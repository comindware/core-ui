// Show Confirmation dialog
const showConfirm = function () {
    const description = 'Confirm Message';

    Core.services.MessageService.confirm(description).then(result => {
        // Handle user response: result true or false
    });
};

// Show 'Ask Yes/No' dialog
const showAskYesNo = function () {
    const description = 'Message question';
    const text = 'Question';

    Core.services.MessageService.askYesNo(description, text).then(result => {
        // Handle user response: result true or false
    });
};

// Show Error dialog
const showError = function () {
    const description = 'Error message';
    const text = 'Error';

    Core.services.MessageService.error(description, text).then(() => {
        // Handle user response
    });
};

// Show Custom Message dialog
const showCustomMessageDialog = function () {
    const description = 'Message description';
    const text = 'Title';

    Core.services.MessageService.showMessageDialog(text, description, [
        // Array of buttons
        { id: 'buttonId', text: 'Ok' }
    ]).then(result => {
        // Handle user response: result is id of the pressed button
    });
};

const View = Marionette.View.extend({
    template: Handlebars.compile(
        '<input class="js-confirm__button message-service__button" type="button" value="Show Confirm">'
        + '<input class="js-yes-no__button message-service__button" type="button" value="Show Ask Yes/No">'
        + '<input class="js-error__button message-service__button" type="button" value="Show Error">'
        + '<input class="js-message-dialog__button message-service__button" type="button" value="Show Custom Message Dialog">'),
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
