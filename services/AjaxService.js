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

    define(['module/lib', 'core/utils/utilsApi', './PromiseServer', 'ajaxMap'], function (lib, utilsApi, PromiseServer) {
        var ajaxMap = global.ajaxMap;

        //noinspection JSUnusedGlobalSymbols
        var AjaxServicePrototype = {
            getResponse: function (type, url, data, options) {
                utilsApi.helpers.assertArgumentNotFalsy(type, 'type');
                utilsApi.helpers.assertArgumentNotFalsy(url, 'url');
                var config = _.extend({
                    type: type,
                    url: url,
                    data: JSON.stringify(data || {}),
                    traditional: true,
                    dataType: 'json',
                    contentType: 'application/json'
                }, options || {});
                var promise = Promise.resolve($.ajax(config));
                return PromiseServer.registerPromise(promise);
            },

            sendFormData: function (url, formData) {
                utilsApi.helpers.assertArgumentNotFalsy(url, 'url');
                utilsApi.helpers.assertArgumentNotFalsy(formData, 'formData');
                return Promise.resolve($.ajax({
                    url: url,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                }));
            },

            getJsApiResponse: function (url, parameterNames, parameters, callback) {
                if (callback && !_.isFunction(callback)) {
                    utilsApi.helpers.throwArgumentError('Invalid argument: callback is set but not a function.');
                }
                var parametersLength = _.last(parameters) === callback && callback !== undefined ? parameters.length - 1 : parameters.length;
                if (parametersLength < parameterNames.length) {
                    utilsApi.helpers.throwFormatError(
                        utilsApi.helpers.format(
                            'Invalid request parameters: expected {0} parameters, actual: {1}.',
                            parameterNames.length,
                            parametersLength));
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
                        } else if (successCallback) {
                            successCallback(result.data);
                        }
                    }.bind(this)
                }).then(function (result) {
                    if (result.success !== true) {
                        this.trigger('jsApi:error', result);
                        var error = new Error(result.errorMessage);
                        error.name = 'JsApiError';
                        error.errorType = result.errorType;
                        error.errorData = result.errorData;
                        throw error;
                    }
                    return result.data;
                }.bind(this));
            }
        };

        _.each(ajaxMap, function (actionInfo) {
            var controller = AjaxServicePrototype[actionInfo.className] || (AjaxServicePrototype[actionInfo.className] = {});

            // The result of compilation below is something like this:
            //     controller[actionInfo.methodName] = function RecordTypes_List(/*optional*/ callback) {
            //         return window.Ajax.getJsApiResponse('RecordTypes/List', [  ], _.take(arguments, 0), callback);
            //     };
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
