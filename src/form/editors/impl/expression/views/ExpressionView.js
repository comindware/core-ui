import template from '../templates/expression.html';

export default Marionette.View.extend({
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

    onAttach() {
        this.ui.expressionInput.val(this.value);
    }
});
