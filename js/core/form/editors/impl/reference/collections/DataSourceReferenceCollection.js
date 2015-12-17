/**
 * Developer: Stepan Burguchev
 * Date: 3/20/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Backbone, Marionette, $, _ */

define(['./BaseReferenceCollection'],
    function (BaseReferenceCollection) {
        'use strict';

        return BaseReferenceCollection.extend({
            initialize: function (collection, options) {
                this.options = options;
            },

            url: 'api/ReferenceEditorDataSourceApi',

            fetch: function (options) {
                options = options || {};
                options.data = options.data || {};

                options.data.dataSourceId = this.options.dataSourceId;
                options.data.displayAttribute = this.options.displayAttribute;
                options.data.formId = this.options.formId;
                return BaseReferenceCollection.prototype.fetch.call(this, options);
            }
        });
    });
