const constants = {
    DEFAULT_MODE_WIDTH: 250,
    COMPACT_MODE_WIDTH: 50,
    MODE_CHANGE_DURATION_MS: 200,
    MIN_WIDTH: 500
};

export default Marionette.View.extend({
    initialize(options) {
        this.firstPanel = options.firstPanel;
        this.secondPanel = options.secondPanel;
    },

    className: 'split-panel-resizer_container',

    template: Handlebars.compile('<div class="js-resizer split-panel_resizer"></div>'),

    onRender() {
        this.originalParentWidth = this.firstPanel.parentEl().offsetWidth;
        this.originalPanel1Width = this.firstPanel.el.getBoundingClientRect().width;
        this.$el.css('left', `${this.originalPanel1Width}px`);

        this.$el.draggable({
            axis: 'x',
            drag: (event, ui) => this.__onResizerDrag(ui),
            stop: () => this.__onDragStop()
        });
    },

    __onResizerDrag(ui) {
        const totalWidth = this.originalParentWidth;
        let width = ui.position.left;

        if (width < constants.MIN_WIDTH) {
            width = constants.MIN_WIDTH;
            ui.position.left = totalWidth - width;
        }

        const maxWidth = totalWidth - constants.MIN_WIDTH;

        if (width > maxWidth) {
            width = maxWidth;
            //ui.position.left = otherElementsMinWidth;
        }

        this.firstPanel.$el.css('flex', `0 0 ${width}px`);
    },

    __onDragStop() {}
});
