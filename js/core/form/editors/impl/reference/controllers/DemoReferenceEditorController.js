/**
 * Developer: Stepan Burguchev
 * Date: 12/10/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import list from '../../../../../list/listApi';
import SearchMoreModel from '../models/SearchMoreModel';
import DefaultReferenceModel from '../models/DefaultReferenceModel';

const config = {
    DEFAULT_COUNT: 200
};

let createDemoData = function () {
    return _.times(1000, function (i) {
        var id = 'task.' + (i + 1);
        return {
            id: id,
            text: 'Test Reference ' + (i + 1)
        };
    });
};

let DemoReferenceCollections = Backbone.Collection.extend({
    model: DefaultReferenceModel
});

export default Marionette.Controller.extend({
    initialize: function (options) {
        this.collection = list.factory.createWrappedCollection(new DemoReferenceCollections([]));
    },

    fetch: function (options) {
        options = options || {};
        var deferred = $.Deferred();
        var promise = deferred.promise();
        setTimeout(function () {
            if (promise !== this.fetchPromise) {
                deferred.reject();
                return;
            }

            this.collection.reset(createDemoData());
            if (options.text) {
                var filterText = options.text.trim().toUpperCase();
                if (filterText) {
                    this.collection.filter(function (model) {
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
            } else {
                this.collection.filter(null);
            }

            this.totalCount = 123123;
            deferred.resolve();
            this.fetchPromise = null;
        }.bind(this), 1000);
        this.fetchPromise = promise;
        return this.fetchPromise;
    },

    navigate: function (model) {
        helpers.throwError('Not Implemented.', 'NotImplementedError');
    }
});
