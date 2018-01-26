/**
 * Developer: Stanislav Guryev
 * Date: 01.27.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import DocumentRevisionItemView from './DocumentRevisionItemView';
import template from '../templates/documentRevisionPanel.html';

export default Marionette.CompositeView.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            isSingleRevision: this.collection.length === 1
        };
    },

    childView: DocumentRevisionItemView,

    childViewContainer: '.js-revision-list'
});

