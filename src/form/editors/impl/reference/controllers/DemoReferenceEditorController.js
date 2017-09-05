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

const createDemoData = function() {
    return _.times(1000, i => {
        const id = `task.${i + 1}`;
        return {
            id,
            text: `Test Reference ${i}`
        };
    });
};

const DemoReferenceCollections = Backbone.Collection.extend({
    model: DefaultReferenceModel
});

export default Marionette.Controller.extend({
    initialize(options) {
        this.collection = list.factory.createWrappedCollection(new DemoReferenceCollections([]));
    },

    fetch(options) {
        options = options || {};
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (promise !== this.fetchPromise) {
                    reject();
                    return;
                }

                this.collection.reset(createDemoData());
                if (options.text) {
                    const filterText = options.text.trim().toUpperCase();
                    if (filterText) {
                        this.collection.filter(model => {
                            const text = model.get('text');
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
            }, 1000);
        });
        this.fetchPromise = promise;
        return promise;
    },

    createValueUrl(value) {
        return `#example/${value.id}`;
    },

    edit(value) {
        alert(`You could edit ${value.id} here.`);
        return true;
    }
});
