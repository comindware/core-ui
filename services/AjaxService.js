/**
 * Developer: Stepan Burguchev
 * Date: 8/4/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    define([ 'module/lib', 'ajaxMap' ], function () {
        var ajaxMap = global.ajaxMap;

        var request = function () {

        };

        var Ajax = {
            getResponse: function (type, url, data, options) {
                var config = _.extend({
                    type: type,
                    url: url,
                    data: JSON.stringify(data || {}),
                    traditional: true,
                    dataType: 'json',
                    contentType: 'application/json'
                }, options || {});
                return $.ajax(config);
            }
        };

        _.each(ajaxMap, function (actionInfo) {
            var controller = Ajax[actionInfo.className] || (Ajax[actionInfo.className] = {});
            //noinspection JSUnresolvedVariable
            controller[actionInfo.methodName] = function () {

            };
        });
        
        global.Ajax = Ajax;
        return Ajax;
    });
}(this));
