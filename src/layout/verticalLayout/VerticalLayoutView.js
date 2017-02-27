/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers } from 'utils';

const classes = {
    CLASS_NAME: 'layout__vertical-layout',
    ITEM: 'layout__vertical-layout-item'
};

export default Marionette.LayoutView.extend({
    initialize (options) {
        helpers.ensureOption(options, 'rows');
    },

    template: false,

    className: classes.CLASS_NAME,

    onShow () {
        this.options.rows.forEach(view => {
            const $regionEl = $('<div></div>').addClass(classes.ITEM);
            this.$el.append($regionEl);
            const region = this.addRegion(_.uniqueId('verticalLayoutItem'), {
                el: $regionEl
            });
            region.show(view);
        });
    }
});
