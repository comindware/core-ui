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
        if (this.__state.enabled !== nextState.enabled) {
            this.view.trigger('change:enabled', this.view, nextState.enabled);
        }
        this.__state = nextState;
    },

    __computeViewState(): { visible: boolean, enabled: boolean } {
        let visible = this.view.options.visible;
        let enabled = this.view.options.enabled;

        if (visible == null) {
            visible = true;
        }
        if (enabled == null) {
            enabled = true;
        }

        visible = typeof visible === 'function' ? visible.call(this.view) : visible;
        enabled = typeof enabled === 'function' ? enabled.call(this.view) : enabled;

        return {
            visible: Boolean(visible),
            enabled: Boolean(enabled)
        };
    }
});
