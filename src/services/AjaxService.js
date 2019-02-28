import PromiseService from './PromiseService';
import MobileService from './MobileService';
import helpers from '../utils/helpers';

const methodName = {
    mvc: 'Mvc',
    WebApi: 'WebApi'
};

let beforeSent = null;

export default (window.Ajax = new (Marionette.MnObject.extend({
    load(options) {
        options.ajaxMap.forEach(actionInfo => {
            /* eslint-disable */
            const controller = this[actionInfo.className] || (this[actionInfo.className] = {});

            // The result of compilation below is something like this:
            //     controller[actionInfo.methodName] = function RecordTypes_List(/*optional*/ callback) {
            //         return window.Ajax.getJsApiResponse('RecordTypes/List', [  ], _.take(arguments, 0), callback);
            //     };
            const actionParameters = actionInfo.parameters.map(parameterInfo => `/*${parameterInfo.typeName}*/ ${parameterInfo.name}`);

            actionParameters.push('/*optional*/ callback');
            const actionBody = helpers.format(
                "return window.Ajax.getJsApiResponse('{0}', [ {1} ], _.take(arguments, {2}) || [], '{3}', '{4}', callback);",
                actionInfo.url,
                actionInfo.parameters.map(p => `'${p.name}'`).join(', '),
                actionInfo.parameters.length,
                actionInfo.httpMethod,
                actionInfo.protocol
            );
            //noinspection JSUnresolvedVariable
            const actionFn = helpers.format('function {0}_{1}({2}) {\r\n{3}\r\n}', actionInfo.className, actionInfo.methodName, actionParameters.join(', '), actionBody);

            eval(`controller[actionInfo.methodName] = ${actionFn};`);
            /* eslint-enable */
        });

        if (options.beforeSent) {
            beforeSent = options.beforeSent;
        }
    },

    async getResponse(method, url, body, options) {
        const config = Object.assign(
            {
                method,
                body: body ? JSON.stringify(body) : null,
                headers: {
                    'Content-type': 'application/json'
                }
            },
            options || {}
        );

        if (beforeSent) {
            const canProceed = await beforeSent();

            if (canProceed) {
                return PromiseService.registerPromise(fetch(url, config));
            }
        } else {
            return PromiseService.registerPromise(fetch(url, config));
        }
    },

    sendFormData(url, formData) {
        return Promise.resolve(
            fetch(url, {
                method: 'POST',
                body: formData,
                processData: false
            })
        );
    },

    getJsApiResponse(url, parameterNames, parameters, httpMethod, protocol) {
        let data;
        if (protocol === methodName.WebApi) {
            for (let i = 0; i < parameterNames.length; i++) {
                if (url.indexOf(parameterNames[i]) !== -1) {
                    /*eslint-disable*/
                    url = url.replace(`{${parameterNames[i]}}`, parameters[i]); // set up url parameters
                    /* eslint-enable */
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

        return this.getResponse(httpMethod, url, data)
            .then(response => response.json())
            .then(response => {
                if (response && protocol === methodName.WebApi && !response.errorMessage) {
                    return response;
                }
                if (response && response.success === false) {
                    this.trigger('jsApi:error', response);
                    const error = new Error(response.errorMessage);
                    error.name = 'JsApiError';
                    error.errorType = response.errorType;
                    error.errorData = response.errorData;
                    error.source = response;

                    if (window.onunhandledrejection === undefined) {
                        if (MobileService.isIE) {
                            const unhandledRejectionEvent = document.createEvent('Event');
                            unhandledRejectionEvent.initEvent('unhandledrejection', false, true);
                            Object.assign(unhandledRejectionEvent, error);
                            window.dispatchEvent(unhandledRejectionEvent);
                        } else {
                            const unhandledRejectionEvent = new Event('unhandledrejection');
                            Object.assign(unhandledRejectionEvent, error, { reason: error });
                            window.dispatchEvent(unhandledRejectionEvent);
                        }
                    }
                    throw error;
                }
                return response ? response.data : response;
            });
    }
}))());
