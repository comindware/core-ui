import { helpers } from 'utils';
import list from 'list';

/**
 * @name BaseReferenceEditorController
 * @memberof module:core.form.editors.reference.controllers
 * @class Base data provider class for {@link module:core.form.editors.ReferenceEditorView ReferenceEditorView}.
 * Data request is performed by fetching Backbone.Collection passed via <code>options.collection</code> option.
 * Various scenarios are covered and server request is made only if it is required.
 * @param {Object} options Options object.
 * @param {Backbone.Collection} options.collection Backbone.Collection of objects. The objects must have <code>id</code> and <code>text</code> attributes.
 * The collection must implement <code>fetch()</code> method that supports text filtration.
 * For example, the call <code>collection.fetch({ data: { filter: 'myFilterText' } })</code> must
 * fetch the objects which contains 'myFilterText' in it's text attribute.
 * Besides that, the <code>collection.totalCount</code> attribute must be updated during the fetch and contain
 * the total count of object with the applied filter on server.
 * */

export default Marionette.Object.extend(
    /** @lends module:core.form.editors.reference.controllers.BaseReferenceEditorController.prototype */ {
        initialize(options) {
            helpers.ensureOption(options, 'collection');

            this.collection = list.factory.createWrappedCollection(options);
        },

        /**
         * Requests data with a text filter applied.
         * @param {Object} options Options object.
         * @param {Object} options.text Text filter filter to apply or <code>null</code>.
         * @return {Promise} Promise object that resolves when the data is ready.
         * */
        fetch({ text = '' }) {
            return this.collection.fetch({ data: { filter: text } }).then(() => {
                this.collection.rebuild();
                this.totalCount = this.collection.parentCollection ? this.collection.parentCollection.totalCount : this.collection.totalCount;

                return {
                    collection: this.collection.toJSON(),
                    totalCount: this.totalCount
                };
            });
        },

        /*
    * Backbone.Collection that should be used to read data. The data should not be fetched from this object directly.
    * Use the controller's <code>fetch()</code> method instead.
    * */
        collection: null,

        createValueUrl() {
            return false;
        },

        /**
         * Handles the edit request to the editor.
         * @param {Object} value Value object that describes the object to edit.
         * */
        edit() {
            return false;
        }
    }
);
