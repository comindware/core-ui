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

define(['core/libApi', 'core/services/LocalizationService'],
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

            /**
             * Позволяет осуществить предварительную валидацию свойств объекта.
             * Поддерживает проверку свойств подобъектов. Кидает исключение <code>MissingPropertyError</code> в случае ошибки.
             * @example
             * // Checks that property this.view.moduleRegion exists.
             * core.utils.helpers.ensureOption(this.view, 'moduleRegion');
             * @param {Object} object Проверяемый объект.
             * @param {String} propertyName Имя проверяемого свойства или разделенный точками путь к нему.
             * */
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

            /**
             * Позволяет получить свойство объекта (или подобъекта) без ошибок в случае, если сам объект или его подобъекты не заданы.
             * @example
             * var foo = { a: {} };
             * // returns undefined (doesn't throw an error)
             * core.utils.helpers.getPropertyOrDefault(foo, 'a.b.c.d');
             * @param {String} propertyPath Имя получаемого свойства или разделенный точками путь к нему.
             * @param {Object} obj Объект, на который применяется путь.
             * */
            getPropertyOrDefault: function (propertyPath, obj) {
                return [obj].concat(propertyPath.split('.')).reduce(function(prev, curr) {
                    return prev === undefined ? undefined : prev[curr];
                });
            },

            /**
             * Позволяет осуществить предварительную валидацию, что значение не равно <code>undefined, null, 0, '', false</code>.
             * Кидает исключение <code>ArgumentFalsyError</code> в случае ошибки.
             * @example
             * core.utils.helpers.assertArgumentNotFalsy(argument1, 'argument1');
             * @param {*} argumentValue Проверяемое значение.
             * @param {String} argumentName Имя проверяемой переменной. Указывается тексте исключения.
             * */
            assertArgumentNotFalsy: function (argumentValue, argumentName) {
                if (!argumentValue) {
                    this.throwError('Argument `' + argumentName + '` is falsy.', 'ArgumentFalsyError');
                }
            },

            /**
             * Упрощенный способ бросить объект-исключение.
             * @example
             * core.utils.helpers.throwError('Request is invalid.');
             * @param {String} message Сообщение об ошибке.
             * @param {String} [name='Error'] Имя исключения (поле Name объекта Error).
             * */
            throwError: function (message, name) {
                var error = new Error(message);
                error.name = name || 'Error';
                throw error;
            },

            /**
             * Бросает InvalidOperationError. Возникает внутри метода класса, когда объект находится в некорректном состоянии.
             * @example
             * // Inside of implementation of some Marionette.View.
             * addKeyboardListener: function (key, callback) {
             *     if (!this.keyListener) {
             *         utilsApi.helpers.throwInvalidOperationError('You must apply keyboard listener after \'render\' event has happened.');
             *     }
             *     var keys = key.split(',');
             *     _.each(keys, function (k) {
             *         this.keyListener.simple_combo(k, callback);
             *     }, this);
             * },
             * // ...
             * @param {String} [message='Invalid operation'] Сообщение об ошибке.
             * */
            throwInvalidOperationError: function (message) {
                helpers.throwError(message || 'Invalid operation', 'InvalidOperationError');
            },

            /**
             * Throws FormatError. The exception should be thrown when the format of an argument is invalid, or when a is not well formed.
             * @example
             * function (url, parameterNames, parameters, callback) {
             *     // Some code here ...
             *     if (parameters.Length !== parameterNames.length) {
             *         utilsApi.helpers.throwFormatError('The arrays `parameters` and `parameterNames` should have identical length.');
             *     }
             *     // Some code here ...
             * @param {String} [message='Invalid format'] Сообщение об ошибке.
             * */
            throwFormatError: function (message) {
                helpers.throwError(message || 'Invalid format', 'FormatError');
            },

            /**
             * Throws ArgumentError. The exception should be thrown when one of the arguments provided to a method is not valid.
             * Should be thrown only when one particular argument is invalid. If a combination of arguments is invalid use <code>FormatError</code>.
             * @example
             * function (url, parameterNames, parameters, callback) {
             *     // Some code here ...
             *     if (parameterNames.Length !== 2) {
             *         utilsApi.helpers.throwArgumentError('The array `parameterNames` should contain exactly 2 elements.');
             *     }
             *     // Some code here ...
             * @param {String} [message='Invalid argument'] Сообщение об ошибке.
             * */
            throwArgumentError: function (message) {
                helpers.throwError(message || 'Invalid argument', 'ArgumentError');
            },

            /**
             * Throws NotSupportedError. The exception should be thrown when an invoked method is not supported.
             * For example: some class doesn't support all the methods of the interface it implements.
             * @example
             * // Inside of implementation of some Stream class
             * seek() {
             *     // Some code here ...
             *     utilsApi.helpers.throwNotSupportedError('The network stream doesn't support `seek`.');
             *     // Some code here ...
             * }
             * @param {String} [message='The operation is not supported'] Сообщение об ошибке.
             * */
            throwNotSupportedError: function (message) {
                helpers.throwError(message || 'The operation is not supported', 'NotSupportedError');
            },

            /**
             * Throws NotImplementedError. The exception should be thrown when a requested method or operation is not implemented.
             * For example: a base class could have abstract methods that throws such error.
             * @example
             * // Inside of implementation of some base controller class.
             * navigate() {
             *     utilsApi.helpers.throwNotImplementedError();
             * }
             * @param {String} [message='The operation is not implemented'] Сообщение об ошибке.
             * */
            throwNotImplementedError: function (message) {
                helpers.throwError(message || 'The operation is not implemented', 'NotImplementedError');
            },

            /**
             * Throws NotFoundError. The exception should be thrown when a requested object could not be found.
             * For example: we looked up in the database and could find a person with requested id.
             * @param {String} [message='Object not found'] Сообщение об ошибке.
             * */
            throwNotFoundError: function (message) {
                helpers.throwError(message || 'Object not found', 'NotFoundError');
            }
        };

        return helpers;
    });
