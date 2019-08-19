import PromiseService from './PromiseService';
import MobileService from './MobileService';
import helpers from '../utils/helpers';

const methodName = {
    mvc: 'Mvc',
    WebApi: 'WebApi'
};

interface ActionInfo {
    className: string;
    methodName: string;
    url: string;
    parameters: any;
    httpMethod: 'GET' | 'POST' | 'PUT';
    protocol: 'Mvc' | 'WebApi';
}

let beforeSent = null;

export default window.Ajax = new (Marionette.MnObject.extend({
    load(options) {
        options.ajaxMap.forEach((actionInfo: ActionInfo) => {
            const controller = this[actionInfo.className] || (this[actionInfo.className] = {});

            controller[actionInfo.methodName] = function() {
                return this.getJsApiResponse(actionInfo.url, actionInfo.parameters.map(p => `${p.name}`), Object.values(arguments), actionInfo.httpMethod, actionInfo.protocol);
            }.bind(this);
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
                    Accept: 'application/json',
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
}))();
