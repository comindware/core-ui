/**
 * Developer: Stepan Burguchev
 * Date: 3/20/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
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
