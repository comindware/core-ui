const collapsedClass = 'collapsed';

export default Marionette.Behavior.extend({
    events: {
        'click .js-expand-btn': '__handleExpandClick'
    },

    onRender() {
        this.__toggleCollapseState();
    },

    __handleExpandClick(event) {
        event.stopPropagation();

        this.view.model.collapsed = !this.view.model.collapsed;
        this.__toggleCollapseState();
    },

    __toggleCollapseState() {
        this.view.el.querySelector('.js-tree-item').classList.toggle(collapsedClass, this.view.model.collapsed);

        if (this.view.model.collapsed) {
            this.view.$el.children('.js-branch-collection').hide(200, null, () => console.log('xxx'));
        } else {
            this.view.$el.children('.js-branch-collection').show(200, null, () => console.log('ppp'));
        }
    }
});
