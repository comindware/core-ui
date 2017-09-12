/**
 * Developer: Ksenia Kartvelishvili
 * Date: 8/31/2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import ReferenceBubblePanelTitleItemView from './ReferenceBubblePanelTitleItemView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.collection = this.model.get('value');
    },

    childView: ReferenceBubblePanelTitleItemView,

    childViewOptions: {
        reqres: this.reqres,
        getDisplayText: this.options.getDisplayText
    }
});

