const constants = {
    DEFAULT_MODE_WIDTH: 250,
    COMPACT_MODE_WIDTH: 50,
    MODE_CHANGE_DURATION_MS: 200,
    MIN_WIDTH: 500,
    MIN_HEIGHT: 300
};

export default Marionette.View.extend({
    initialize(options) {
        this.firstPanel = options.firstPanel;
        this.secondPanel = options.secondPanel;
    },

    className: 'split-panel-resizer_container',

    template: Handlebars.compile('<div class="js-resizer split-panel_resizer"></div>'),

    onRender() {
        if (this.options.orientation === 'horizontal') {
            const originalPanel1Height = this.firstPanel.el.getBoundingClientRect().height;

            this.$el.css('left', '');
            this.$el.css('top', `${originalPanel1Height + this.firstPanel.el.offsetTop}px`);
            this.originalParentHeight = this.firstPanel.parentEl().offsetTop;
            this.minimumLeft = this.firstPanel.el.offsetTop + constants.MIN_HEIGHT;
            this.el.className = 'split-panel-resizer_container split-panel-resizer_horizontal';

            this.$el.draggable({
                axis: 'y',
                drag: (event, ui) => this.__onResizerDragHorizontal(ui)
            });
        } else {
            const originalPanel1Width = this.firstPanel.el.getBoundingClientRect().width;

            this.$el.css('top', '');
            this.$el.css('left', `${originalPanel1Width + this.firstPanel.el.offsetLeft}px`);
            this.originalParentWidth = this.firstPanel.parentEl().offsetWidth;
            this.minimumLeft = this.firstPanel.el.offsetLeft + constants.MIN_WIDTH;
            this.el.className = 'split-panel-resizer_container split-panel-resizer_vertical';

            this.$el.draggable({
                axis: 'x',
                drag: (event, ui) => this.__onResizerDragVertical(ui)
            });
        }
    },

    toggleOrientation(type) {
        this.options.orientation = type;
        this.render();
    },

    __onResizerDragVertical(ui) {
        const totalWidth = this.originalParentWidth;
        let width = ui.position.left;

        if (width < constants.MIN_WIDTH) {
            width = constants.MIN_WIDTH;
            ui.position.left = this.minimumLeft;
        }

        const maxWidth = totalWidth - constants.MIN_WIDTH;

        if (width > maxWidth) {
            width = maxWidth;
            ui.position.left = this.firstPanel.el.offsetLeft + maxWidth;
        }

        this.firstPanel.$el.css('flex', `0 0 ${width}px`);
    },

    __onResizerDragHorizontal(ui) {
        const totalHeight = this.originalParentHeight;
        let height = ui.position.height;

        if (height < constants.MIN_HEIGHT) {
            height = constants.MIN_HEIGHT;
            ui.position.left = this.minimumLeft;
        }

        const maxHeight = totalHeight - constants.MIN_HEIGHT;

        if (height > maxHeight) {
            height = maxHeight;
            ui.position.left = this.firstPanel.el.offsetLeft + maxHeight;
        }

        this.firstPanel.$el.css('flex', `0 0 ${maxHeight}px`);
    }
});
