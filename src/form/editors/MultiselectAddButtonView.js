export default Marionette.View.extend({
    className: 'button-sm_h3 button-sm button-sm_add',
    tagName: 'button',
    template: Handlebars.compile('{{text}}')
});
