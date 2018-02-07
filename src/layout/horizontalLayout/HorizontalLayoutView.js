
import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from './horizontalLayout.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__horizontal-layout',
    ITEM: 'layout__horizontal-layout-list-item',
    HIDDEN: 'layout__hidden'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'columns');

        this.columns = options.columns;
    },

    template: Handlebars.compile(template),

    className: classes.CLASS_NAME,

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    ui: {
        list: '.js-list'
    },

    templateContext() {
        return {
            title: this.options.title
        };
    },

    onRender() {
        this.__rowsCtx = [];
        this.options.columns.forEach(view => {
            view.on('change:visible', this.__handleChangeVisibility.bind(this));
            const $regionEl = $('<div></div>').addClass(classes.ITEM);
            this.ui.list.append($regionEl);
            const id = _.uniqueId('horizontalLayoutItem');
            const region = this.addRegion(id, {
                el: $regionEl
            });
            this.__rowsCtx.push({
                view,
                $regionEl,
                region
            });
            this.showChildView(id, view);
        });
        this.__updateState();
    },

    update() {
        this.columns.forEach(view => {
            if (view.update) {
                view.update();
            }
        });
        this.__updateState();
    },

    __handleChangeVisibility(view, visible) {
        const ctx = this.__rowsCtx.find(x => x.view === view);
        ctx.$regionEl.toggleClass(classes.HIDDEN, !visible);
    }
});
