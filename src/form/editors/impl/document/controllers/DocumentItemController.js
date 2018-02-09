
import { dateHelpers } from 'utils';

const reqres = Backbone.Radio.channel('documentsChannel');

export default Marionette.Object.extend({
    initialize(options = {}) {
        this.view = options.view;
        this.reqres = reqres;
    },

    channelName: 'documentsChannel',

    radioEvents: {
        'document:revise': '__getDocumentRevision'
    },

    async __getDocumentRevision(documentId) {
        const result = await Ajax.Documents.GetDocumentRevisions(documentId);
        return result.map(item => ({
            id: item.Id,
            creator: item.CreatorName,
            url: item.RevisionLink,
            creationDate: dateHelpers.dateToDateTimeString(item.CreationDate, 'generalDateShortTime'),
            version: item.RevisionIndex
        }));
    }
});

