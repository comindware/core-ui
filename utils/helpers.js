/**
 * Developer: Stepan Burguchev
 * Date: 8/21/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, _, $ */

define(['module/lib', 'core/services/LocalizationService'],
    function (lib, LocalizationService) {
        'use strict';

        var timeoutCache = {};

        var queueCache = {};

        var helpers = {
            /*
            * Simple helper that calls setTimeout and clears the previously called one (if it was called before).
            *
            * Work as follows:
            * 1. Check if setTimeout was called for SomeUniqueId key within the delay time
            * 2. Call clearTimeout if true
            * 3. Call setTimeout(callback, delay)
            * */
            setUniqueTimeout: function (someUniqueId, callback, delay)
            {
                var timeoutId = timeoutCache[someUniqueId];
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                var handler = setTimeout(function ()
                {
                    callback();
                    delete timeoutCache[someUniqueId];
                }, delay);
                timeoutCache[someUniqueId] = handler;
                return handler;
            },

            nextTick: function (callback, someUniqueId)
            {
                if (someUniqueId) {
                    return helpers.setUniqueTimeout(someUniqueId, callback, 10);
                } else {
                    return setTimeout(callback, 10);
                }
            },

            comparatorFor: function (comparatorFn, propertyName) {
                if (comparatorFn.length === 1) {
                    return function (a) {
                        return comparatorFn(a.get(propertyName));
                    };
                } else if (comparatorFn.length === 2) {
                    return function (a, b) {
                        return comparatorFn(a.get(propertyName), b.get(propertyName));
                    };
                } else {
                    throw new Error('Invalid arguments count in comparator function.');
                }
            },

            createLocalizedText: function (defaultText) {
                return {
                    en: defaultText,
                    de: defaultText,
                    ru: defaultText
                };
            },

            /*
            * Javascript version of string.Format in .NET
            * */
            format: function(text) {
                if (!_.isString(text)) {
                    return '';
                }
                for (var i = 1; i < arguments.length; i++) {
                    var regexp = new RegExp('\\{'+(i-1)+'\\}', 'gi');
                    text = text.replace(regexp, arguments[i]);
                }
                return text;
            },

            /*
            * Taking a number and array of strings, returns a valid plural form:
            * getPluralForm(1, ['car','cars']) -> 'car'
            * getPluralForm(10, ['car','cars']) -> 'cars'
            * Works with complex cases and valid for all supported languages (en, de, ru)
            * */
            getPluralForm: (function (formula) {
                var getIndex = new Function('n', 'var r = ' + formula + ';return typeof r !== \'boolean\' ? r : r === true ? 1 : 0;'); // jshint ignore:line
                return function (n, texts) {
                    return texts.split(',')[getIndex(n)];
                };
            })(LocalizationService.get('CORE.SERVICES.LOCALIZATION.PLURALFORM')),

            /*
            * Puts operation into the fifo queue with specific Id and returns a promise that resolves on operation complete.
            * The Operation must return promise object.
            * */
            enqueueOperation: function (operation, queueId) {
                if (queueCache[queueId] && queueCache[queueId].isPending()) {
                    queueCache[queueId] = queueCache[queueId].then(function() {
                        return _.isFunction(operation) ? operation() : operation;
                    });
                } else {
                    queueCache[queueId] = Promise.resolve(_.isFunction(operation) ? operation() : operation);
                }
                return queueCache[queueId];
            },

            applyBehavior: function (target) {
                var behaviors = _.rest(arguments, 1);
                _.each(behaviors, function (Behavior) {
                    _.extend(target, new Behavior(target));
                });
            },
            
            ensureOption: function (options, optionName) {
                if (!options) {
                    helpers.throwError('The options object is required.', 'MissingOptionError');
                }
                if (optionName.indexOf('.') !== -1) {
                    var selector = optionName.split('.');
                    for (var i = 0, len = selector.length; i < len; i++) {
                        optionName = selector[i];
                        if (options[optionName] === undefined) {
                            optionName = _.take(selector, i + 1).join('.');
                            helpers.throwError('The option `' + optionName + '` is required.', 'MissingOptionError');
                        }
                        options = options[optionName];
                    }
                } else {
                    if (options[optionName] === undefined) {
                        helpers.throwError('The option `' + optionName + '` is required.', 'MissingOptionError');
                    }
                }
            },

            ensureProperty: function (object, propertyName) {
                if (!object) {
                    helpers.throwError('The object is null.', 'NullObjectError');
                }
                if (propertyName.indexOf('.') !== -1) {
                    var selector = propertyName.split('.');
                    for (var i = 0, len = selector.length; i < len; i++) {
                        propertyName = selector[i];
                        if (object[propertyName] === undefined) {
                            propertyName = _.take(selector, i + 1).join('.');
                            helpers.throwError('The property `' + propertyName + '` is required.', 'MissingPropertyError');
                        }
                        object = object[propertyName];
                    }
                } else {
                    if (object[propertyName] === undefined) {
                        helpers.throwError('The property `' + propertyName + '` is required.', 'MissingPropertyError');
                    }
                }
            },

            getPropertyOrDefault: function (propertyPath, obj) {
                return [obj].concat(propertyPath.split('.')).reduce(function(prev, curr) {
                    return prev === undefined ? undefined : prev[curr];
                });
            },

            throwError: function (message, name) {
                var error = new Error(message);
                error.name = name || 'Error';
                throw error;
            },

            throwInvalidOperationError: function (message) {
                helpers.throwError(message || 'Invalid operation', 'InvalidOperationError');
            },

            throwFormatError: function (message) {
                helpers.throwError(message || 'Invalid format', 'FormatError');
            },

            throwNotSupportedError: function (message) {
                helpers.throwError(message || 'The operation is not supported', 'NotSupportedError');
            },

            throwNotImplementedError: function (message) {
                helpers.throwError(message || 'The operation is not implemented', 'NotImplementedError');
            },

            throwNotFoundError: function (message) {
                helpers.throwError(message || 'Object not found', 'NotFoundError');
            }
        };

        return helpers;
    });
