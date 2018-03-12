import { helpers } from 'utils';
import LayoutBehavior from './behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__vertical-layout',
    ITEM: 'layout__vertical-layout-item',
    HIDDEN: 'layout__hidden'
};

export default Marionette.ItemView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'rows');

        this.rows = options.rows;
    },

    tagName: 'div',

    template: false,

    className: classes.CLASS_NAME,

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    templateHelpers() {
        return {
            title: this.options.title
        };
    },

    onRender() {
        this.__rowsCtx = [];
        this.rows.forEach(view => {
            view.on('change:visible', (activeView, visible) => this.__handleChangeVisibility(activeView, visible));

            this.$el.append(view.render().$el);
            this.__rowsCtx.push({
                view
            });
        });
        this.__updateState();
    },

    update() {
        this.rows.forEach(view => {
            if (view.update) {
                view.update();
            }
        });
        this.__updateState();
    },

    __handleChangeVisibility(view, visible) {
        view.$el.toggleClass(classes.HIDDEN, !visible);
    },

    onDestroy() {
        this.rows.forEach(view => view.destroy());
    }
});
