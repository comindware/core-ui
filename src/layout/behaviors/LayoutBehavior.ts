const classes: { HIDDEN: string } = {
    HIDDEN: 'layout__hidden'
};

export default Marionette.Behavior.extend({
    initialize(options: {}, view): void {
        view.__updateState = this.__updateState.bind(this);

        this.__state = {};
    },

    __updateState(): void {
        const nextState = this.__computeViewState();

        if (this.__state.visible !== nextState.visible) {
            this.$el.toggleClass(classes.HIDDEN, !nextState.visible);
            this.view.trigger('change:visible', this.view, nextState.visible);
        }
        this.__state = nextState;
    },

    __computeViewState(): { visible: boolean } {
        let visible = this.view.options.visible;

        if (visible == null) {
            visible = true;
        }

        visible = typeof visible === 'function' ? visible.call(this.view) : visible;

        return {
            visible: Boolean(visible)
        };
    }
});
