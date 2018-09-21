//TODO: Remove after reference editor refactoring
/**
 * @param {containerId} options.containerId Container ID to get reference collection's data.
 * @param {searchId} options.searchId Reference id to request initial editor's value.
 */
import BaseReferenceCollection from '../../form/editors/impl/datalist/collections/BaseReferenceCollection';

export default BaseReferenceCollection.extend({
    initialize(collection, options) {
        this.options = options;
    },

    url: 'DatasetData/QueryAutocompleteData',

    fetch(options = { data: {} }) {
        const config = options;

        config.type = 'POST';

        if (config.reset === undefined) {
            config.reset = true;
        }

        config.data.datasource = this.options.datasourceId;
        config.data.query = this.options.query;

        if (config.data.query) {
            config.data.query.datasetId = config.data.query.id;
        }
        if (!this.models[0] || !this.models[0].get('text')) {
            config.data.searchId = this.options.searchId;
        } else {
            config.data.searchId = null;
        }

        config.processData = false;

        return Backbone.Collection.prototype.fetch.call(this, {
            data: JSON.stringify(config.data),
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            traditional: true
        });
    }
});
