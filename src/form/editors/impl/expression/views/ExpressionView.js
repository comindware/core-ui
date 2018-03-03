import template from '../templates/expression.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    ui: {
        expressionInput: '.js-expression-input'
    },

    className: 'pp-setting__textarea',

    getValue() {
        return this.ui.expressionInput.val();
    },

    setValue(value) {
        this.value = value;
    },

    onShow() {
        this.ui.expressionInput.val(this.value);
    }
});
