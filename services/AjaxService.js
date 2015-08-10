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

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    define([ 'module/lib', 'core/utils/utilsApi', 'ajaxMap' ], function (lib, utilsApi) {
        var ajaxMap = global.ajaxMap;

        //noinspection JSUnusedGlobalSymbols
        var AjaxServicePrototype = {
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
            },

            getJsApiResponse: function (url, parameterNames, parameters, callback) {
                if (callback && !_.isFunction(callback)) {
                    utilsApi.helpers.throwArgumentError('Invalid argument: callback is set but not a function.');
                }
                if (parameters.length < parameterNames.length || _.last(parameters) === callback) {
                    utilsApi.helpers.throwFormatError(
                        utilsApi.helpers.format(
                            'Invalid request parameters: expected {0} parameters, actual: {1}.',
                            parameterNames.length,
                            parameters.length));
                }
                var successCallback = callback || null;

                var data = {};
                for (var i = 0; i < parameterNames.length; i++) {
                    data[parameterNames[i]] = parameters[i];
                }

                return this.getResponse('POST', url, data, {
                    success: function(result) {
                        if (result.success !== true) {
                            this.trigger('jsApi:error', result);
                        }
                        if (successCallback) {
                            successCallback(result.data);
                        }
                    }.bind(this)
                });
            }
        };

        _.each(ajaxMap, function (actionInfo) {
            var controller = AjaxServicePrototype[actionInfo.className] || (AjaxServicePrototype[actionInfo.className] = {});

            var actionParameters = _.map(actionInfo.parameters, function (parameterInfo) {
                return '/*' + parameterInfo.typeName + '*/ ' + parameterInfo.name;
            });
            actionParameters.push('/*optional*/ callback');
            var actionBody = utilsApi.helpers.format(
                'return window.Ajax.getJsApiResponse(\'{0}\', [ {1} ], _.take(arguments, {2}), callback);',
                actionInfo.url,
                _.map(actionInfo.parameters, function (p) { return '\'' + p.name + '\''; }).join(', '),
                actionInfo.parameters.length
            );
            //noinspection JSUnresolvedVariable
            var actionFn = utilsApi.helpers.format(
                'function {0}_{1}({2}) {\r\n{3}\r\n}',
                actionInfo.className,
                actionInfo.methodName,
                actionParameters.join(', '), actionBody
            );

            eval('controller[actionInfo.methodName] = ' + actionFn + ';'); // jshint ignore:line
        });

        var AjaxService = Marionette.Object.extend(AjaxServicePrototype);
        
        global.Ajax = new AjaxService();
        return global.Ajax;
    });
}(this));
