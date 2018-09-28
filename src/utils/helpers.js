/*eslint-ignore*/
import LocalizationService from '../services/LocalizationService';

const timeoutCache = {};
const queueCache = {};
let getPluralFormIndex = null;

export default /** @lends module:core.utils.helpers */ {
    /**
     * Deprecated. Use <code>_.debounce()</code> instead. Defers invoking the function until after `delay` milliseconds
     * have elapsed since the last time it was invoked.
     * @param {String} someUniqueId Function identifier.
     * @param {Function} callback The function tobe called after delay.
     * @param {Number} delay Callback delay in milliseconds.
     * @deprecated
     * */
    setUniqueTimeout(someUniqueId, callback, delay) {
        const timeoutId = timeoutCache[someUniqueId];
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        const handler = setTimeout(() => {
            callback();
            delete timeoutCache[someUniqueId];
        }, delay);
        timeoutCache[someUniqueId] = handler;
        return handler;
    },

    /**
     * Deprecated. Use <code>_.defer()</code> instead. Defers invoking the function until the current call stack has cleared.
     * @param {Function} callback Callback to be called when the current call stack has cleared.
     * @deprecated
     * */
    nextTick(callback) {
        return setTimeout(callback, 10);
    },

    /**
     * Creates and returns a new function that maps the passed comparator onto the specified attribute of Backbone.Model.
     * Look at the example for details.
     * @example
     * var referenceComparator = core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'text');
     * var a = new Backbone.Model({ id: 2, text: '1' });
     * var b = new Backbone.Model({ id: 1, text: '2' });
     * // returns -1
     * var result = referenceComparator(a, b);
     * @param {Function} comparatorFn Wrapped comparator function. 1 or 2 arguments.
     * @param {String} propertyName Attribute of a Backbone.Model to which the function is mapped.
     * @return {Function} Result function.
     * */
    comparatorFor(comparatorFn, propertyName) {
        if (comparatorFn.length === 1) {
            return a => comparatorFn(a.get(propertyName));
        } else if (comparatorFn.length === 2) {
            return (a, b) => comparatorFn(a.get(propertyName), b.get(propertyName));
        }
        throw new Error('Invalid arguments count in comparator function.');
    },

    /**
     * Accepts string and duplicates it into every field of LocalizedText object.
     * The LocalizedText  looks like this: <code>{ en: 'foo', de: 'foo', ru: 'foo' }</code>.
     * @param {String} defaultText A text that is set into each field of the resulting LocalizedText object.
     * @return {Object} LocalizedText object like <code>{ en, de, ru }</code>.
     * */
    createLocalizedText(defaultText) {
        return {
            en: defaultText,
            de: defaultText,
            ru: defaultText
        };
    },

    /**
     * Javascript version of the Microsoft .NET framework method <code>string.Format</code>.
     * @example
     * // returns 'Hello, Javascript!'
     * core.utils.helpers.format('Hello, {0}!', 'Javascript');
     * @param {String} text Formatted text that contains placeholders like <code>{i}</code>.
     * Where <code>i</code> - index of the inserted argument (starts from zero).
     * @param {...*} arguments Arguments that will replace the placeholders in text.
     * @return {String} Resulting string.
     * */
    format(string, ...values) {
        if (!_.isString(string)) {
            return '';
        }
        return string.replace(/\{(\d)\}/g, (s, num) => values[num]);
    },

    /**
     * Takes a number and array of strings and then returns a valid plural form.
     * Works with complex cases and valid for all supported languages (by default for en, de and ru).
     * The core algorithm is located in localization text `CORE.SERVICES.LOCALIZATION.PLURALFORM`.
     * @function
     * @example
     * // returns 'car'
     * core.utils.helpers.getPluralForm(1, 'car,cars');
     * // returns 'cars'
     * core.utils.helpers.getPluralForm(10, 'car,cars');
     * @param {Number} n A number which requires a correct work form.
     * @param {String} texts Comma separated string of word forms.
     * (2 word forms for en and de, 3 word forms for ru).
     * @return {String} Resulting string.
     * */
    getPluralForm(n, texts) {
        if (!getPluralFormIndex) {
            const formula = LocalizationService.get('CORE.SERVICES.LOCALIZATION.PLURALFORM');
            getPluralFormIndex = new Function('n', `var r = ${formula};return typeof r !== 'boolean' ? r : r === true ? 1 : 0;`); // jshint ignore:line
        }
        return texts.split(',')[getPluralFormIndex(n)];
    },

    /**
     * Creates a queue of asynchronous operations.
     * New operation function is executed only after the previous function with the same id has executed.
     * @example
     * var save = form.save.bind(form);
     * // Three sequential calls
     * var promise1 = core.utils.helpers.enqueueOperation(save, 42);
     * var promise2 = core.utils.helpers.enqueueOperation(save, 42);
     * var promise3 = core.utils.helpers.enqueueOperation(save, 42);
     * promise3.then(function () {
     *     // Will be called only when all the 'save' operations has been fired and returned success.
     * });
     * @param {Function} operation A function that triggers asynchronous operation and returns a Promise object.
     * @param {String} queueId String identifier of operations queue.
     * */
    enqueueOperation(operation, queueId) {
        if (queueCache[queueId] && queueCache[queueId].isPending()) {
            queueCache[queueId] = queueCache[queueId].then(() => (_.isFunction(operation) ? operation() : operation));
        } else {
            queueCache[queueId] = Promise.resolve(_.isFunction(operation) ? operation() : operation);
        }
        return queueCache[queueId];
    },

    /**
     * Sequentially applies passed Behavior objects on to the given instance.
     * The method has nothing to do with Marionette.Behavior.
     * @example
     * core.utils.helpers.applyBehavior(this, core.models.behaviors.SelectableBehavior);
     * @param {Object} target Target instance that is getting behaviors applied.
     * @param {...Function} arguments 1 or more Behavior objects (constructor functions).
     * */
    applyBehavior(target) {
        const behaviors = _.rest(arguments, 1);
        _.each(behaviors, Behavior => {
            _.extend(target, new Behavior(target));
        });
    },

    /**
     * Allows to perform validation of input options. The method is usually used in constructor or initializer methods.
     * Allows to check both direct and nested properties of the options object.
     * Throws <code>MissingOptionError</code> if the attribute is undefined.
     * @example
     * // Checks that property options.model exists.
     * core.utils.helpers.ensureOption(options, 'model');
     * // Checks that property options.property1.subProperty exists.
     * core.utils.helpers.ensureOption(options, 'property1.subProperty');
     * @param {Object} options Options object to check.
     * @param {String} optionName Property name or dot-separated property path.
     * */
    ensureOption(options, optionName) {
        if (!options) {
            Core.InterfaceError.logError('The options object is required.', 'MissingOptionError');
        }
        let recursiveOptions = options;

        if (optionName.indexOf('.') !== -1) {
            const selector = optionName.split('.');
            for (let i = 0, len = selector.length; i < len; i++) {
                let name = selector[i];
                if (recursiveOptions[name] === undefined) {
                    name = _.take(selector, i + 1).join('.');
                    Core.InterfaceError.logError(`The option \`${name}\` is required.`, 'MissingOptionError');
                }
                recursiveOptions = recursiveOptions[name];
            }
        } else if (options[optionName] === undefined) {
            Core.InterfaceError.logError({
                error: `The option \`${optionName}\` is required.`,
                object: options
            });
        }
    },

    /**
     * Allows to perform validation of property in an object. Allows to check both direct and nested properties of the object.
     * Throws <code>MissingOptionError</code> if the attribute is undefined.
     * @example
     * // Checks that property this.view.moduleRegion exists.
     * core.utils.helpers.ensureOption(this.view, 'moduleRegion');
     * @param {Object} object An object to check.
     * @param {String} propertyName Property name or dot-separated property path.
     * */
    ensureProperty(options, optionName) {
        if (!options) {
            this.throwError('The options object is required.', 'MissingOptionError');
        }
        let recursiveOptions = options;

        if (optionName.indexOf('.') !== -1) {
            const selector = optionName.split('.');
            for (let i = 0, len = selector.length; i < len; i++) {
                let name = selector[i];
                if (recursiveOptions[name] === undefined) {
                    name = _.take(selector, i + 1).join('.');
                    this.throwError(`The option \`${name}\` is required.`, 'MissingOptionError');
                }
                recursiveOptions = recursiveOptions[name];
            }
        } else if (options[optionName] === undefined) {
            this.throwError(`The option \`${optionName}\` is required.`, 'MissingOptionError');
        }
    },

    /**
     * Allows to retrieve a property (or subproperty) of an object. Does not throw any error if one of the properties along the way are missing.
     * Doesn't throw if the object itself is undefined.
     * @example
     * var foo = { a: {} };
     * // returns undefined (doesn't throw an error)
     * core.utils.helpers.getPropertyOrDefault(foo, 'a.b.c.d');
     * @param {String} propertyPath propertyName Property name or dot-separated property path.
     * @param {Object} obj An object to get the property from.
     * */
    getPropertyOrDefault(propertyPath, obj) {
        return [obj].concat(propertyPath.split('.')).reduce((prev, curr) => (prev === undefined ? undefined : prev[curr]));
    },

    /**
     * Pre-validation helper that allows to check that function argument is not falsy.
     * Falsy value means that the value is one of the following: <code>undefined, null, 0, '', false</code>.
     * Throws <code>ArgumentFalsyError</code> if validation is failed.
     * @example
     * core.utils.helpers.assertArgumentNotFalsy(argument1, 'argument1');
     * @param {*} argumentValue Value to check.
     * @param {String} argumentName Name of the checked argument. Needs to specify in the exception text.
     * */
    assertArgumentNotFalsy(argumentValue, argumentName) {
        if (!argumentValue) {
            this.throwError(`Argument \`${argumentName}\` is falsy.`, 'ArgumentFalsyError');
        }
    },

    /**
     * Simplified way to throw an error. Throws an Error object with the specified name and message.
     * @example
     * core.utils.helpers.throwError('Request is invalid.');
     * @param {String} message Error message.
     * @param {String} [name='Error'] Error name (`name` attribute of Error object).
     * */
    throwError(message, name) {
        const error = new Error(message);
        error.name = name || 'Error';
        Core.InterfaceError.logError(error);
    },

    /**
     * Throws InvalidOperationError. The exception should be thrown when a class is in invalid state to call the checked method.
     * @example
     * // Inside of implementation of some Marionette.View.
     * addKeyboardListener: function (key, callback) {
     *     if (!this.keyListener) {
     *         utils.helpers.throwInvalidOperationError('You must apply keyboard listener after \'render\' event has happened.');
     *     }
     *     var keys = key.split(',');
     *     _.each(keys, function (k) {
     *         this.keyListener.simple_combo(k, callback);
     *     }, this);
     * },
     * // ...
     * @param {String} [message='Invalid operation'] Error message.
     * */
    throwInvalidOperationError(message) {
        this.throwError(message || 'Invalid operation', 'InvalidOperationError');
    },

    /**
     * Throws FormatError. The exception should be thrown when the format of an argument is invalid, or when a is not well formed.
     * @example
     * function (url, parameterNames, parameters, callback) {
     *     // Some code here ...
     *     if (parameters.Length !== parameterNames.length) {
     *         utils.helpers.throwFormatError('The arrays `parameters` and `parameterNames` should have identical length.');
     *     }
     *     // Some code here ...
     * @param {String} [message='Invalid format'] Error message.
     * */
    throwFormatError(message) {
        this.throwError(message || 'Invalid format', 'FormatError');
    },

    /**
     * Throws ArgumentError. The exception should be thrown when one of the arguments provided to a method is not valid.
     * Should be thrown only when one particular argument is invalid. If a combination of arguments is invalid use <code>FormatError</code>.
     * @example
     * function (url, parameterNames, parameters, callback) {
     *     // Some code here ...
     *     if (parameterNames.Length !== 2) {
     *         utils.helpers.throwArgumentError('The array `parameterNames` should contain exactly 2 elements.');
     *     }
     *     // Some code here ...
     * @param {String} [message='Invalid argument'] Error message.
     * */
    throwArgumentError(message) {
        this.throwError(message || 'Invalid argument', 'ArgumentError');
    },

    /**
     * Throws NotSupportedError. The exception should be thrown when an invoked method is not supported.
     * For example: some class doesn't support all the methods of the interface it implements.
     * @example
     * // Inside of implementation of some Stream class
     * seek() {
     *     // Some code here ...
     *     utils.helpers.throwNotSupportedError('The network stream doesn't support `seek`.');
     *     // Some code here ...
     * }
     * @param {String} [message='The operation is not supported'] Error message.
     * */
    throwNotSupportedError(message) {
        this.throwError(message || 'The operation is not supported', 'NotSupportedError');
    },

    /**
     * Throws NotImplementedError. The exception should be thrown when a requested method or operation is not implemented.
     * For example: a base class could have abstract methods that throws such error.
     * @example
     * // Inside of implementation of some base controller class.
     * navigate() {
     *     utils.this.throwNotImplementedError();
     * }
     * @param {String} [message='The operation is not implemented'] Error message.
     * */
    throwNotImplementedError(message) {
        this.throwError(message || 'The operation is not implemented', 'NotImplementedError');
    },

    /**
     * Throws NotFoundError. The exception should be thrown when a requested object could not be found.
     * For example: we looked up in the database and could find a person with requested id.
     * @param {String} [message='Object not found'] Error message.
     * */
    throwNotFoundError(message) {
        this.throwError(message || 'Object not found', 'NotFoundError');
    }
};
