import template from 'text-loader!../templates/navBarItem.html';

export default Marionette.View.extend({
    className() {
        let result = `demo-nav__i demo-nav__i_${this.model.id}`;
        if (this.model.get('selected')) {
            result += ' demo-nav__i_selected';
        }
        return result;
    },

    template: Handlebars.compile(template)
});
