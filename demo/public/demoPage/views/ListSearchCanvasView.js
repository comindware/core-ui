/**
 * Developer: Stepan Burguchev
 * Date: 8/17/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from 'text-loader!../templates/listSearchCanvas.html';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        searchRegion: '.js-search-region',
        contentRegion: '.js-content-region'
    },

    className: 'demo-list-canvas__view_search',

    onShow() {
        this.contentRegion.show(this.options.content);
        this.searchRegion.show(this.options.search);
    }
});
