/**
 * Developer: Zaycev Ivan
 * Date: 03.07.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/iconCollectionView.html';
import IconItemCategoryView from './IconItemCategoryView';

export default Marionette.CollectionView.extend({
    className: 'ld-setting-dd-panel ld-setting-dd-panel_icons dev-setting-dd-panel_icons',

    template: Handlebars.compile(template),

    childView: IconItemCategoryView,

    childEvents: {
        'click:item': '__triggerChildSelect'
    },

    __triggerChildSelect(model, id) {
        this.trigger('click:item', id);
    }
});
