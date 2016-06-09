/**
 * Developer: Stepan Burguchev
 * Date: 12/12/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import list from '../../../../../list/listApi';
import SearchMoreModel from '../models/SearchMoreModel';

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

export default Marionette.Controller.extend( /** @lends module:core.form.editors.reference.controllers.BaseReferenceEditorController.prototype */ {
    initialize: function(options) {
        helpers.ensureOption(options, 'collection');

        this.originalCollection = options.collection;
        this.collection = list.factory.createWrappedCollection(options.collection);
    },

    /**
     * Requests data with a text filter applied.
     * @param {Object} options Options object.
     * @param {Object} options.text Text filter filter to apply or <code>null</code>.
     * @return {Promise} Promise object that resolves when the data is ready.
     * */
    fetch: function(options) {
        options = options || {};

        var filterText = options.text ? options.text.trim().toUpperCase() : '';
        if (filterText.indexOf(this.activeFilterText) && this.totalCount) {
            // Client-side filter
            if (filterText) {
                this.collection.filter(function(model) {
                    if (model instanceof SearchMoreModel) {
                        return true;
                    }
                    var text = model.get('text');
                    if (!text) {
                        return false;
                    }
                    return text.toUpperCase().indexOf(filterText) !== -1;
                });
            } else {
                this.collection.filter(null);
            }
            return Promise.resolve();
        }
        // Server-side filter or new data request
        this.collection.filter(null);
        this.fetchPromise = this.collection.fetch({ data: { filter: filterText } })
            .then(function() {
                this.totalCount = this.collection.totalCount;
                this.activeFilterText = filterText;
            }.bind(this));

        return this.fetchPromise;
    },

    /*
    * Backbone.Collection that should be used to read data. The data should not be fetched from this object directly.
    * Use the controller's <code>fetch()</code> method instead.
    * */
    collection: null,

    /**
     * Handles a navigation request to an object. The method is abstract.
     * @param {Backbone.Model} model Data model that describes the object to navigate to.
     * */
    navigate: function(model) {
        helpers.throwError('Not Implemented.', 'NotImplementedError');
    }
});
