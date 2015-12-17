/**
 * Developer: Stepan Burguchev
 * Date: 12/4/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Backbone, Marionette, $, _ */

define([
        'core/libApi',
        'core/utils/utilsApi',
        'core/collections/behaviors/HighlightableBehavior',
        'core/models/behaviors/SelectableBehavior',
        '../models/DefaultReferenceModel'
    ],
    function (lib, utils, HighlightableBehavior, SelectableBehavior, DefaultReferenceModel) {
        'use strict';

        var defaultOptions = {
            DEFAULT_COUNT: 200
        };

        return Backbone.Collection.extend({
            constructor: function () {
                Backbone.Collection.prototype.constructor.apply(this, arguments);
                _.extend(this, new HighlightableBehavior(this));
                _.extend(this, new SelectableBehavior.SingleSelect(this));
            },
            
            fetch: function (options) {
                utils.helpers.ensureOption(options, 'data.filter');
                if (options.data.count === undefined) {
                    options.data.count = defaultOptions.DEFAULT_COUNT;
                }
                if (options.reset === undefined) {
                    options.reset = true;
                }
                return Backbone.Collection.prototype.fetch.call(this, options);
            },

            parse: function (response, options)
            {
                this.totalCount = response.totalCount;
                return Backbone.Collection.prototype.parse.call(this, response.options, options);
            },

            model: DefaultReferenceModel,

            url: null
        });
    });
