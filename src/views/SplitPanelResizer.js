import { splitViewTypes } from '../Meta';

const constants = {
    DEFAULT_MODE_WIDTH: 250,
    COMPACT_MODE_WIDTH: 50,
    MODE_CHANGE_DURATION_MS: 200,
    MIN_WIDTH: 200,
    MIN_HEIGHT: 200
};

export default Marionette.View.extend({
    initialize(options) {
        this.firstPanel = options.firstPanel;
        this.secondPanel = options.secondPanel;
        this.__debounceOnResize = _.debounce(this.__handleWindowResize, 50);
        this.__resetListeners();
    },

    className: 'split-panel-resizer_container',

    template: Handlebars.compile('<div class="js-resizer split-panel_resizer"></div>'),

    onRender() {
        Core.services.UIService.undraggable({ el: this.el });
        const rect = this.firstPanel.el.getBoundingClientRect();
        const parentRect = this.firstPanel.parentEl().getBoundingClientRect();
        if (this.options.orientation === splitViewTypes.HORIZONTAL) {
            let originalPanelHeight = rect.height;
            this.topOffset = rect.top;
            this.originalParentHeight = parentRect.height + parentRect.top;
            this.el.className = 'split-panel-resizer_container split-panel-resizer_horizontal';
            if (this.options.splitViewPosition) {
                originalPanelHeight = Number(this.options.splitViewPosition);
            }
            this.__setTopPosition(originalPanelHeight);

            Core.services.UIService.draggable({
                el: this.el,
                axis: 'y',
                drag: (event, ui) => this.__onResizerDragHorizontal(ui),
                stop: (event, ui) => {
                    const height = ui.offsetTop - this.topOffset;
                    this.trigger('change:resizer', height, this.options.orientation);
                }
            });
        } else if (this.options.orientation === splitViewTypes.VERTICAL) {
            let originalPanelWidth = rect.width;
            this.leftOffset = rect.left;
            this.originalParentWidth = parentRect.width;
            this.el.className = 'split-panel-resizer_container split-panel-resizer_vertical';
            if (this.options.splitViewPosition) {
                originalPanelWidth = Number(this.options.splitViewPosition);
            }
            this.__setLeftPosition(originalPanelWidth);

            Core.services.UIService.draggable({
                el: this.el,
                axis: 'x',
                drag: (event, ui) => this.__onResizerDragVertical(ui),
                stop: (event, ui) => {
                    const width = ui.offsetLeft - this.el.offsetParent.offsetLeft;
                    this.trigger('change:resizer', width, this.options.orientation);
                }
            });
        } else {
            this.el.className = 'split-panel-resizer_container split-panel-resizer_general';
        }
    },

    toggleOrientation(type, position) {
        this.options.orientation = type;
        this.options.splitViewPosition = position;
        this.__resetListeners();
    },

    __resetListeners() {
        this.stopListening(Core.services.GlobalEventService, 'window:resize', this.__debounceOnResize);
        if (this.options.orientation === splitViewTypes.HORIZONTAL || this.options.orientation === splitViewTypes.VERTICAL) {
            this.listenTo(Core.services.GlobalEventService, 'window:resize', this.__debounceOnResize);
        }
    },

    __onResizerDragVertical(ui) {
        const width = ui.position.left - this.leftOffset;
        this.__alignVerticalSplitter(width);
        Core.services.GlobalEventService.trigger('window:resize');
    },

    __onResizerDragHorizontal(ui) {
        const height = ui.position.top - this.topOffset;
        this.__alignHorizontalSplitter(height);
        Core.services.GlobalEventService.trigger('window:resize');
    },

    __handleWindowResize() {
        const rect = this.firstPanel.el.getBoundingClientRect();
        if (this.options.orientation === splitViewTypes.HORIZONTAL) {
            this.el.style.top = rect.bottom;
        } else {
            this.el.style.left = rect.right;
        }
    },

    __alignVerticalSplitter(value) {
        let width = value;
        if (width < constants.MIN_WIDTH) {
            width = constants.MIN_WIDTH;
        }
        const maxWidth = this.originalParentWidth - constants.MIN_WIDTH;
        if (width > maxWidth) {
            width = maxWidth;
        }
        this.__setLeftPosition(width);
    },

    __alignHorizontalSplitter(value) {
        let height = value;
        if (height < constants.MIN_HEIGHT) {
            height = constants.MIN_HEIGHT;
        }
        const maxHeight = this.originalParentHeight - constants.MIN_HEIGHT;
        if (height > maxHeight) {
            height = maxHeight;
        }
        this.__setTopPosition(height);
    },

    __setTopPosition(value) {
        this.$el.css('left', '');
        this.el.style.top = `${value + this.topOffset}px`;
        this.firstPanel.$el.css('flex', `0 0 ${value + this.topOffset}px`);
    },

    __setLeftPosition(value) {
        this.$el.css('top', '');
        this.el.style.left = `${value + this.leftOffset}px`;
        this.firstPanel.$el.css('flex', `0 0 ${value + this.leftOffset}px`);
    }
});
