const collapsedClass = 'collapsed';
const animationInterval = 200;

export default Marionette.Behavior.extend({
    initialize() {
        this.view.toggleCollapsedState = this.__toggleCollapsedState.bind(this);
    },

    ui: {
        collapseBtn: '.js-collapse-btn',
        collapseClassElement: '.js-tree-item'
    },

    events: {
        'click @ui.collapseBtn': '__onCollapseBtnClick'
    },

    onRender() {
        this.__toggleCollapsedState({ collapsed: !!this.view.model.collapsedNode });
    },

    __toggleCollapsedState(options: { interval: number, collapsed: boolean }) {
        const { interval, collapsed } = options;
        const model = this.view.model;
        const newCollapsed = (model.collapsedNode = collapsed == null ? !model.collapsedNode : collapsed);

        this.ui.collapseClassElement[0]?.classList.toggle(collapsedClass, newCollapsed);
        this.view.collapseChildren({ interval, collapsed: newCollapsed });
    },

    __onCollapseBtnClick(event: MouseEvent) {
        event.stopPropagation();

        this.__toggleCollapsedState({ interval: animationInterval });

        this.view.options.reqres.request('treeEditor:collapse');
    }
});
