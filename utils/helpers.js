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

define(['module/lib'],
    function () {
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
            * Puts operation into the fifo queue with specific Id and returns a promise that resolves on operation complete.
            * The Operation must return promise object.
            * */
            enqueueOperation: function (operation, queueId) {
                // perform model.save or post it into the queue
                var deferred = $.Deferred();
                var storedDeferred = queueCache[queueId];
                queueCache[queueId] = deferred;
                if (storedDeferred) {
                    storedDeferred.then(function () {
                        var operationResult = operation();
                        if (!operationResult) {
                            deferred.resolve();
                        } else {
                            operationResult.then(function () {
                                deferred.resolve();
                            });
                        }
                    });
                } else {
                    var operationResult = operation();
                    if (!operationResult) {
                        deferred.resolve();
                    } else {
                        operationResult.then(function () {
                            if (queueCache[queueId] === deferred) {
                                queueCache[queueId] = null;
                            }
                            deferred.resolve();
                        });
                    }
                }
                return deferred.promise();
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
                helpers.throwError(message || 'Not Supported', 'NotSupportedError');
            },

            throwNotImplementedError: function (message) {
                helpers.throwError(message || 'Not Implemented', 'NotImplementedError');
            }
        };

        return helpers;
    });
