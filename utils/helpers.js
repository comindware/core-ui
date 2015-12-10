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

        var helpers = /** @lends module:core.utils.helpers */ {
            /**
            * Метод вызывает функцию <code>callback()</code> по прошествии <code>delay</code> миллисекунд с момента
            * последнего вызова этого метода с заданным <code>someUniqueId</code>.
            * @param {String} someUniqueId Идентификатор вызова.
            * @param {Function} callback Функция, которая должна быть вызвана по прошествии заданного интервала времени.
            * @param {Number} delay Задержка вызова функции в миллисекундах.
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

            /**
             * Метод вызывает функцию <code>callback()</code> по окончанию обработки активного события (аналогично setTimeout(fn, 10)).
             * @param {Function} callback Функция, которая должна быть вызвана по окончанию обработки активного события.
             * */
            nextTick: function (callback)
            {
                return setTimeout(callback, 10);
            },

            /**
             * Оборачивает переданную функцию-компаратор применяя ее на заданный атрибут объекта Backbone.Model.
             * @example
             * var referenceComparator = core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'text');
             * var a = new Backbone.Model({ id: 1, text: '1' });
             * var b = new Backbone.Model({ id: 2, text: '2' });
             * // returns -1
             * var result = referenceComparator(a, b);
             * @param {Function} comparatorFn Функция, которая должна быть вызвана по окончанию обработки активного события.
             * @param {String} propertyName Функция, которая должна быть вызвана по окончанию обработки активного события.
             * @return {Function} Обернутая функция.
             * */
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

            /**
             * Принимает строку и создает объект LocalizedText <code>{ en: 'foo', de: 'foo', ru: 'foo' }</code>.
             * @param {String} defaultText Текст, который будет установлен в каждое из свойств результирующего объекта.
             * @return {Object} Объект <code>{ en, de, ru }</code>.
             * */
            createLocalizedText: function (defaultText) {
                return {
                    en: defaultText,
                    de: defaultText,
                    ru: defaultText
                };
            },

            /**
             * Javascript версия .NET метода <code>string.Format</code>.
             * @example
             * // returns 'Hello, Javascript!'
             * core.utils.helpers.format('Hello, {0}!', 'Javascript');
             * @param {String} text Форматируемая строка, содержащая плейсхолдеры в формате <code>{i}</code>.
             * Где <code>i</code> - индекс подставляемого аргумента (начиная с нуля).
             * @param {...*} arguments Агрументы, которые будут подставлены в плейсхолдеры.
             * @return {String} Результирующая строка.
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

            /**
             * Taking a number and array of strings, returns a valid plural form.
             * Works with complex cases and valid for all supported languages (en, de, ru).
             * @function
             * @example
             * // returns 'car'
             * core.utils.helpers.getPluralForm(1, 'car,cars');
             * // returns 'cars'
             * core.utils.helpers.getPluralForm(10, 'car,cars');
             * @param {Number} n Число, для которого необходимо подобрать склонение.
             * @param {String} texts Разделенные запятыми варианты фразы
             * (для английского и немецкого - 2 фразы разделенные запятыми, для русского - 3 фразы разделенные запятыми).
             * @return {String} Результирующая строка.
             * */
            getPluralForm: (function (formula) {
                var getIndex = new Function('n', 'var r = ' + formula + ';return typeof r !== \'boolean\' ? r : r === true ? 1 : 0;'); // jshint ignore:line
                return function (n, texts) {
                    return texts.split(',')[getIndex(n)];
                };
            })(LocalizationService.get('CORE.SERVICES.LOCALIZATION.PLURALFORM')),

            /**
             * Создает очередь из асинхронных операций. Поступающие операции выполняются последовательно.
             * @example
             * var save = form.save.bind(form);
             * // Three sequential calls
             * var promise1 = core.utils.helpers.enqueueOperation(save, 42);
             * var promise2 = core.utils.helpers.enqueueOperation(save, 42);
             * var promise3 = core.utils.helpers.enqueueOperation(save, 42);
             * promise3.then(function () {
             *     // Will be called only when all the 'save' operations has been fired and returned success.
             * });
             * @param {Function} operation функция, запускающая асинхронную операцию и возвращающая объект Promise.
             * @param {String} queueId Строковый идентификатор цепочки операций.
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

            /**
             * Последовательно применяет переданные в аргументах Behavior классы на заданный экземпляр объекта.
             * Никак не связан с применением объектов Marionette.Behavior.
             * @example
             * core.utils.helpers.applyBehavior(this, core.models.behaviors.SelectableBehavior);
             * @param {Object} target Объект, на который будут применены behaviors.
             * @param {...Function} arguments 1 или более функций-конструкторов объектов Behavior.
             * */
            applyBehavior: function (target) {
                var behaviors = _.rest(arguments, 1);
                _.each(behaviors, function (Behavior) {
                    _.extend(target, new Behavior(target));
                });
            },

            /**
             * Позволяет осуществить предварительную валидацию входных опций. Обычно применяется к конструкторе/инициалайзере объекта.
             * Поддерживает проверку свойств подобъектов. Кидает исключение <code>MissingOptionError</code> в случае ошибки.
             * @example
             * // Checks that property options.model exists.
             * core.utils.helpers.ensureOption(options, 'model');
             * // Checks that property options.property1.subProperty exists.
             * core.utils.helpers.ensureOption(options, 'property1.subProperty');
             * @param {Object} options Проверяемый объект опций.
             * @param {String} optionName Имя проверяемого свойства или разделенный точками путь к нему.
             * */
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

            assertArgumentNotFalsy: function (argumentValue, argumentName) {
                if (!argumentValue) {
                    this.throwError('Argument `' + argumentName + '` is falsy.', 'ArgumentFalsyError');
                }
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

            throwArgumentError: function (message) {
                helpers.throwError(message || 'Invalid argument', 'ArgumentError');
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
