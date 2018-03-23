//@flow
import { dateHelpers } from 'utils';

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
            id: item.id,
            creator: item.creatorName,
            url: item.revisionLink,
            creationDate: dateHelpers.dateToDateTimeString(item.creationDate, 'generalDateShortTime'),
            version: item.revisionIndex
        }));
    }
});
