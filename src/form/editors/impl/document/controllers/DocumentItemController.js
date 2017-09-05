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


import meta from '../../../../Meta';

const dateTimeFormats = meta.dateTimeFormats;

export default Marionette.Object.extend({
    initialize(options = {}) {
        this.view = options.view;
        this.reqres = new Backbone.Wreqr.RequestResponse();
        this.reqres.setHandlers({
            'document:revise': this.__getDocumentRevision.bind(this)
        });
    },

    async __getDocumentRevision(documentId) {
        const result = await Ajax.Documents.GetDocumentRevisions(documentId);
        return result.map(item => ({
            id: item.Id,
            creator: item.CreatorName,
            url: item.RevisionLink,
            creationDate: Core.utils.dateHelpers.dateToDateTimeString(item.CreationDate, dateTimeFormats.GENERAL_DATE_SHORT_TIME),
            version: item.RevisionIndex
        }));
    }
});

