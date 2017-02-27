/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from './horizontalLayout.hbs';

const classes = {
    CLASS_NAME: 'layout__horizontal-layout',
    ITEM: 'layout__horizontal-layout-list-item'
};

export default Marionette.LayoutView.extend({
    initialize (options) {
        helpers.ensureOption(options, 'columns');
    },

    template: Handlebars.compile(template),

    className: classes.CLASS_NAME,

    ui: {
        list: '.js-list'
    },

    onShow () {
        this.options.columns.forEach(view => {
            const $regionEl = $('<div></div>').addClass(classes.ITEM);
            this.ui.list.append($regionEl);
            const region = this.addRegion(_.uniqueId('horizontalLayoutItem'), {
                el: $regionEl
            });
            region.show(view);
        });
    }
});
