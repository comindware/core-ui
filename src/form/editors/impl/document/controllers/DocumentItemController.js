//@flow
import { dateHelpers } from 'utils';

export default Marionette.MnObject.extend({
    initialize(options = {}) {
        this.view = options.view;
        this.reqres = Backbone.Radio.channel(_.uniqueId('documentController'));
        this.reqres.reply('document:revise', this.__getDocumentRevision.bind(this));
    },

    async __getDocumentRevision(documentId) {
        if (Ajax && Ajax.Documents) {
            const result = await Ajax.Documents.GetDocumentRevisions(documentId);
            return result.map(item => ({
                id: item.id,
                creator: item.creatorName,
                url: item.revisionLink,
                creationDate: dateHelpers.dateToDateTimeString(item.creationDate, 'generalDateShortTime'),
                version: item.revisionIndex
            }));
        }
        return [];
    }
});
