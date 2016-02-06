/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import template from '../templates/searchMoreListItem.hbs';

export default Marionette.ItemView.extend({
    initialize: function (options) {
        this.reqres = options.reqres;
    },

    className: 'dev-reference-editor__dropdown-view__search-more-list-item-view',

    template: template,

    events: {
        'click': '__searchMore'
    },

    __searchMore: function () {
        this.reqres.request('search:more');
    }
});
