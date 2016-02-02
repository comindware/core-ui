/**
 * Developer: Stepan Burguchev
 * Date: 8/4/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import { helpers } from '../utils/utilsApi';
import PromiseService from './PromiseService';

let extendAjaxService = function (ajaxService, ajaxMap) {
    _.each(ajaxMap, function (actionInfo) {
        var controller = ajaxService[actionInfo.className] || (ajaxService[actionInfo.className] = {});

        // The result of compilation below is something like this:
        //     controller[actionInfo.methodName] = function RecordTypes_List(/*optional*/ callback) {
        //         return window.Ajax.getJsApiResponse('RecordTypes/List', [  ], _.take(arguments, 0), callback);
        //     };
        var actionParameters = _.map(actionInfo.parameters, function (parameterInfo) {
            return '/*' + parameterInfo.typeName + '*/ ' + parameterInfo.name;
        });
        actionParameters.push('/*optional*/ callback');
        var actionBody = helpers.format(
            'return window.Ajax.getJsApiResponse(\'{0}\', [ {1} ], _.take(arguments, {2}), callback);',
            actionInfo.url,
            _.map(actionInfo.parameters, function (p) { return '\'' + p.name + '\''; }).join(', '),
            actionInfo.parameters.length
        );
        //noinspection JSUnresolvedVariable
        var actionFn = helpers.format(
            'function {0}_{1}({2}) {\r\n{3}\r\n}',
            actionInfo.className,
            actionInfo.methodName,
            actionParameters.join(', '), actionBody
        );

        eval('controller[actionInfo.methodName] = ' + actionFn + ';'); // jshint ignore:line
    });
};

var AjaxServicePrototype = {
    initialize: function (options) {
        helpers.ensureOption(options, 'ajaxMap');
        extendAjaxService(this, options.ajaxMap);
    },

    getResponse: function (type, url, data, options) {
        helpers.assertArgumentNotFalsy(type, 'type');
        helpers.assertArgumentNotFalsy(url, 'url');
        var config = _.extend({
            type: type,
            url: url,
            data: JSON.stringify(data || {}),
            traditional: true,
            dataType: 'json',
            contentType: 'application/json'
        }, options || {});
        var promise = Promise.resolve($.ajax(config));
        return PromiseService.registerPromise(promise);
    },

    sendFormData: function (url, formData) {
        helpers.assertArgumentNotFalsy(url, 'url');
        helpers.assertArgumentNotFalsy(formData, 'formData');
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
            helpers.throwArgumentError('Invalid argument: callback is set but not a function.');
        }
        var parametersLength = _.last(parameters) === callback && callback !== undefined ? parameters.length - 1 : parameters.length;
        if (parametersLength < parameterNames.length) {
            helpers.throwFormatError(
                helpers.format(
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
            // TODO: remove this check!
            if (result.refresh) {
                _.defer(function() {
                    window.location.reload();
                });
            }
            return result.data;
        }.bind(this));
    }
};

let global = this; // jshint ignore:line
let AjaxService = Marionette.Object.extend(AjaxServicePrototype);
global.Ajax = new AjaxService();

export default global.Ajax;
