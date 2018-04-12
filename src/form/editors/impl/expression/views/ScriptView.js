import template from '../templates/script.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    ui: {
        scriptInput: '.js-script-input'
    },

    regions: {},

    className: 'pp-setting__textarea',

    getValue() {
        return this.ui.scriptInput.val();
    },

    setValue(value) {
        this.value = value;
    },

    onShow() {
        this.ui.scriptInput.val(this.value);
    }
});
