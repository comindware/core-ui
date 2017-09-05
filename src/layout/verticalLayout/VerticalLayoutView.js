/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers } from 'utils';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__vertical-layout',
    ITEM: 'layout__vertical-layout-item',
    HIDDEN: 'layout__hidden'
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'rows');

        this.rows = options.rows;
    },

    template: false,

    className: classes.CLASS_NAME,

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    onShow() {
        this.__rowsCtx = [];
        this.options.rows.forEach(view => {
            view.on('change:visible', this.__handleChangeVisibility.bind(this));
            const $regionEl = $('<div></div>').addClass(classes.ITEM);
            this.$el.append($regionEl);
            const region = this.addRegion(_.uniqueId('verticalLayoutItem'), {
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
        this.rows.forEach(view => {
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
