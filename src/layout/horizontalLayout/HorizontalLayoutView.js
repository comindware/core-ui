
import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from './horizontalLayout.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__horizontal-layout',
    ITEM: 'layout__horizontal-layout-list-item',
    HIDDEN: 'layout__hidden'
};

export default Marionette.LayoutView.extend({
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

    templateHelpers() {
        return {
            title: this.options.title,
            extraClass: (this.options.breakpoints || this.options.styles) && this.__addBreakpointsAndStyles(this.options.breakpoints, this.options.styles)
        };
    },

    onShow() {
        this.__rowsCtx = [];
        this.options.columns.forEach(view => {
            view.on('change:visible', this.__handleChangeVisibility.bind(this));
            const $regionEl = $('<div></div>').addClass(classes.ITEM);
            this.ui.list.append($regionEl);
            const region = this.addRegion(_.uniqueId('horizontalLayoutItem'), {
                el: $regionEl
            });
            this.__rowsCtx.push({
                view,
                $regionEl,
                region
            });
            region.show(view);
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
    },

    __addBreakpointsAndStyles(brakePoints, styles) {
        const styleShit = document.styleSheets[0];

        const newClass = `horizontalStyle${_.uniqueId()}`;
        if (styles) {
            styleShit.insertRule(`${newClass} ${styles}`, 0);
        }
        if (brakePoints) {
            Object.keys(brakePoints).forEach(point => {
                styleShit.insertRule(`.${newClass} { ${this.__getStringFromObject(brakePoints[point])} }`, 0);
            });
        }

        return `${newClass} ${classes.CLASS_NAME}`;
    },

    __getStringFromObject(object) {
        return Object.keys(object).map(key => `${key}: ${object[key]};`).join(' ');
    }
});
