// @flow
import { helpers } from 'utils';
import LayoutBehavior from './behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__vertical-layout',
    ITEM: 'layout__vertical-layout-item',
    HIDDEN: 'layout__hidden'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'rows');

        this.rows = options.rows;
    },

    tagName: 'div',

    template: false,

    className() {
        return `${classes.CLASS_NAME} ${this.options.class ? this.options.class : ''}`;
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    templateContext() {
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
    },

    onAttach() {
        this.rows.forEach(view => view.triggerMethod('attach'));
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
