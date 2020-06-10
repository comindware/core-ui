import { helpers } from 'utils';
import PromiseService from './PromiseService';
import MobileService from './MobileService';

const methodName = {
    mvc: 'Mvc',
    WebApi: 'WebApi'
};

let beforeSent = null;

export default (window.Ajax = new (Marionette.MnObject.extend({
    load(options) {
        options.ajaxMap.forEach(actionInfo => {
            const controller = this[actionInfo.className] || (this[actionInfo.className] = {});

            controller[actionInfo.methodName] = function() {
                return this.getJsApiResponse(actionInfo.url, actionInfo.parameters.map(p => `${p.name}`), Object.values(arguments), actionInfo.httpMethod, actionInfo.protocol);
            }.bind(this);
        });

        if (options.beforeSent) {
            beforeSent = options.beforeSent;
        }
    },

    async getResponse(type, url, data, options) {
        const config = Object.assign(
            {
                type,
                url,
                data: data ? JSON.stringify(data) : null,
                traditional: true,
                dataType: 'json',
                contentType: 'application/json'
            },
            options || {}
        );

        if (beforeSent) {
            const canProceed = await beforeSent();

            if (canProceed) {
                return PromiseService.registerPromise($.ajax(config));
            }
            return Promise.reject();
        }
        return PromiseService.registerPromise($.ajax(config));
    },

    sendFormData(url, formData) {
        return Promise.resolve(
            $.ajax({
                url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false
            })
        );
    },

    getJsApiResponse(url, parameterNames, parameters, httpMethod, protocol, callback) {
        const successCallback = callback || null;
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

        return this.getResponse(httpMethod, url, data, {
            success: result => {
                if (result && result.success === false) {
                    this.trigger('jsApi:error', result);
                } else if (successCallback) {
                    successCallback(result.data);
                }
            }
        }).then(result => {
            if (result && protocol === methodName.WebApi && !result.errorMessage) {
                return result;
            }
            if (result && result.success === false) {
                this.trigger('jsApi:error', result);
                const error = new Error(result.errorMessage);
                error.name = 'JsApiError';
                error.errorType = result.errorType;
                error.errorData = result.errorData;
                error.source = result;

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
            return result ? result.data : result;
        });
    }
}))());
