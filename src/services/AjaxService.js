/**
 * Developer: Stepan Burguchev
 * Date: 8/4/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers } from 'utils';
import PromiseService from './PromiseService';

const methodName = {
    mvc: 'Mvc',
    WebApi: 'WebApi'
};

export default window.Ajax = new (Marionette.Object.extend({
    load(options) {
        helpers.ensureOption(options, 'ajaxMap');
        options.ajaxMap.forEach(actionInfo => {
            const controller = this[actionInfo.className] || (this[actionInfo.className] = {});

            // The result of compilation below is something like this:
            //     controller[actionInfo.methodName] = function RecordTypes_List(/*optional*/ callback) {
            //         return window.Ajax.getJsApiResponse('RecordTypes/List', [  ], _.take(arguments, 0), callback);
            //     };
            const actionParameters = actionInfo.parameters.map(parameterInfo => `/*${parameterInfo.typeName}*/ ${parameterInfo.name}`);

            actionParameters.push('/*optional*/ callback');
            const actionBody = helpers.format(
                'return window.Ajax.getJsApiResponse(\'{0}\', [ {1} ], _.take(arguments, {2}), \'{3}\', \'{4}\', callback);',
                actionInfo.url,
                actionInfo.parameters.map(p => `'${p.name}'`).join(', '),
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
            eval(`controller[actionInfo.methodName] = ${actionFn};`);
            /* eslint-enable */
        });
    },

    getResponse(type, url, data, options) {
        helpers.assertArgumentNotFalsy(type, 'type');
        helpers.assertArgumentNotFalsy(url, 'url');
        const config = _.extend({
            type,
            url,
            data: data ? JSON.stringify(data) : null,
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
            url,
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
            success: result => {
                if (result && result.success === false) {
                    this.trigger('jsApi:error', result);
                } else if (successCallback) {
                    successCallback(result.data);
                }
            }
        }).then(result => {
            if (protocol === methodName.WebApi && !result.errorMessage) {
                return result;
            }
            if (result.success === false) {
                this.trigger('jsApi:error', result);
                const error = new Error(result.errorMessage);
                error.name = 'JsApiError';
                error.errorType = result.errorType;
                error.errorData = result.errorData;
                error.source = result;
                throw error;
            }
            return result ? result.data : result;
        });
    }
}))();
