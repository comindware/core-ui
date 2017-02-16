/**
 * Developer: Stepan Burguchev
 * Date: 8/4/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import '../libApi';
import { helpers } from '../utils/utilsApi';
import PromiseService from './PromiseService';

const methodName = {
    mvc: 'Mvc',
    WebApi: 'WebApi'
};

let extendAjaxService = function (ajaxService, ajaxMap) {
    _.each(ajaxMap, function (actionInfo) {
        const controller = ajaxService[actionInfo.className] || (ajaxService[actionInfo.className] = {});

        // The result of compilation below is something like this:
        //     controller[actionInfo.methodName] = function RecordTypes_List(/*optional*/ callback) {
        //         return window.Ajax.getJsApiResponse('RecordTypes/List', [  ], _.take(arguments, 0), callback);
        //     };
        const actionParameters = _.map(actionInfo.parameters, parameterInfo => `/*${parameterInfo.typeName}*/ ${parameterInfo.name}`);

        actionParameters.push('/*optional*/ callback');
        const actionBody = helpers.format(
            'return window.Ajax.getJsApiResponse(\'{0}\', [ {1} ], _.take(arguments, {2}), \'{3}\', \'{4}\', callback);',
            actionInfo.url,
            _.map(actionInfo.parameters, p => `'${p.name}'`).join(', '),
            actionInfo.parameters.length,
            actionInfo.httpMethod,
            actionInfo.protocol
        );
        //noinspection JSUnresolvedVariable
        const actionFn = helpers.format(
            'function {0}_{1}({2}) {\r\n{3}\r\n}',
            actionInfo.className,
            actionInfo.methodName,
            actionParameters.join(', '), actionBody
        );
        /* eslint-disable */
        eval(`controller[actionInfo.methodName] = ${actionFn};`); // jshint ignore:line
        /* eslint-enable */
    });
};

let AjaxServicePrototype = {
    load(options) {
        helpers.ensureOption(options, 'ajaxMap');
        extendAjaxService(this, options.ajaxMap);
    },

    getResponse(type, url, data, options) {
        helpers.assertArgumentNotFalsy(type, 'type');
        helpers.assertArgumentNotFalsy(url, 'url');
        const config = _.extend({
            type: type,
            url: url,
            data: JSON.stringify(data || {}),
            traditional: true,
            dataType: 'json',
            contentType: 'application/json'
        }, options || {});
        const promise = Promise.resolve($.ajax(config));
        return PromiseService.registerPromise(promise);
    },

    sendFormData(url, formData) {
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

    getJsApiResponse(url, parameterNames, parameters, httpMethod, protocol, callback) {
        if (callback && !_.isFunction(callback)) {
            helpers.throwArgumentError('Invalid argument: callback is set but not a function.');
        }
        const parametersLength = _.last(parameters) === callback && callback !== undefined ? parameters.length - 1 : parameters.length;
        if (parametersLength < parameterNames.length) {
            helpers.throwFormatError(
                helpers.format(
                    'Invalid request parameters: expected {0} parameters, actual: {1}.',
                    parameterNames.length,
                    parametersLength));
        }
        const successCallback = callback || null;
        let data;
        if (protocol === methodName.WebApi) {
            for (let i = 0; i < parameterNames.length; i++) {
                if (url.indexOf(parameterNames[i]) !== -1) {
                    url = url.replace(`{${parameterNames[i]}}`, parameters[i]); // set up url parameters
                } else {
                    data = parameters[i]; // set up [FromBody] parameters
                }
            }
        } else {
            data = {};
            for (let i = 0; i < parameterNames.length; i++) {
                data[parameterNames[i]] = parameters[i];
            }
        }

        return this.getResponse(httpMethod, url, data, {
            success: function (result) {
                if (result.success !== true) {
                    this.trigger('jsApi:error', result);
                } else if (successCallback) {
                    successCallback(result.data);
                }
            }.bind(this)
        }).then(function (result) {
            if (protocol === methodName.WebApi && !result.errorMessage) {
                return result;
            }
            if (result.success !== true) {
                this.trigger('jsApi:error', result);
                const error = new Error(result.errorMessage);
                error.name = 'JsApiError';
                error.errorType = result.errorType;
                error.errorData = result.errorData;
                error.source = result;
                throw error;
            }
            return result.data;
        }.bind(this));
    }
};

let AjaxService = Marionette.Object.extend(AjaxServicePrototype);
export default window.Ajax = new AjaxService();
