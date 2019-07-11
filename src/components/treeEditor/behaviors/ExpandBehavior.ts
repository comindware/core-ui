const collapsedClass = 'collapsed';
const animationInterval = 200;

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
        this.__toggleCollapseState(animationInterval);
    },

    __toggleCollapseState(interval = animationInterval) {
        this.view.el.querySelector('.js-tree-item').classList.toggle(collapsedClass, this.view.model.collapsed);

        if (this.view.model.collapsed) {
            this.view.$el.children('.js-branch-collection').hide(interval);
        } else {
            this.view.$el.children('.js-branch-collection').show(interval);
        }
    }
});
