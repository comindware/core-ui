/**
 * Developer: Stepan Burguchev
 * Date: 12/10/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers } from 'utils';
import list from 'list';
import DefaultReferenceModel from '../models/DefaultReferenceModel';

const config = {
    DEFAULT_COUNT: 200
};

let createDemoData = function () {
    return _.times(1000, function (i) {
        let id = `task.${i + 1}`;
        return {
            id: id,
            text: `Test Reference ${i}`
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
        let promise = new Promise((resolve, reject) => {
            setTimeout(function () {
                if (promise !== this.fetchPromise) {
                    reject();
                    return;
                }

                this.collection.reset(createDemoData());
                if (options.text) {
                    let filterText = options.text.trim().toUpperCase();
                    if (filterText) {
                        this.collection.filter(function (model) {
                            let text = model.get('text');
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

                this.totalCount = 1000;
                resolve({
                    collection: this.collection.toJSON(),
                    totalCount: this.totalCount
                });
                this.fetchPromise = null;
            }.bind(this), 1000);
        });
        this.fetchPromise = promise;
        return promise;
    },

    createValueUrl (value) {
        return `#example/${value.id}`;
    },

    edit: function (value) {
        alert(`You could edit ${value.id} here.`);
        return true;
    }
});
