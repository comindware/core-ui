import template from '../templates/groupItem.html';

const classes = {
    selected: 'selected'
};

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    tagName: 'li',

    onRender() {
        this.$el.toggleClass(classes.selected, !!this.model.selected);
    },

    className: 'navigationDrawer__li'
});
