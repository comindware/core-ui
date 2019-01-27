/*eslint-disable*/
import LocalizationService from '../services/LocalizationService';
import InterfaceErrorMessageService from '../services/InterfaceErrorMessageService';
import _ from 'underscore';

let getPluralFormIndex = null;

export default /** @lends module:core.utils.helpers */ {
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
    comparatorFor(comparatorFn: Function, propertyName: string) {
        if (comparatorFn.length === 1) {
            return (a: Backbone.Model) => comparatorFn(a.get(propertyName));
        } else if (comparatorFn.length === 2) {
            return (a: Backbone.Model, b: Backbone.Model) => comparatorFn(a.get(propertyName), b.get(propertyName));
        }
        throw new Error('Invalid arguments count in comparator function.');
    },

    format(string: string, ...values: Array<any>): string {
        return string.replace(/\{(\d)\}/g, (s, num) => values[num]);
    },

    replaceCurlyParameters(string: string, ...values: Array<any>) {
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
    getPluralForm(n: number, texts: string) {
        if (!getPluralFormIndex) {
            const formula = LocalizationService.get('CORE.SERVICES.LOCALIZATION.PLURALFORM');
            getPluralFormIndex = new Function('n', `var r = ${formula};return typeof r !== 'boolean' ? r : r === true ? 1 : 0;`); // jshint ignore:line
        }
        return texts.split(',')[getPluralFormIndex(n)];
    },

    /**
     * Sequentially applies passed Behavior objects on to the given instance.
     * The method has nothing to do with Marionette.Behavior.
     * @example
     * core.utils.helpers.applyBehavior(this, core.models.behaviors.SelectableBehavior);
     * @param {Object} target Target instance that is getting behaviors applied.
     * @param {...Function} arguments 1 or more Behavior objects (constructor functions).
     * */
    applyBehavior(target: Object) {
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
    ensureOption(options: Object, optionName: string) {
        if (!options) {
            InterfaceErrorMessageService.logError('The options object is required.', 'MissingOptionError');
        }
        let recursiveOptions = options;

        if (optionName.indexOf('.') !== -1) {
            const selector = optionName.split('.');
            for (let i = 0, len = selector.length; i < len; i++) {
                let name = selector[i];
                if (recursiveOptions[name] === undefined) {
                    name = _.take(selector, i + 1).join('.');
                    InterfaceErrorMessageService.logError(`The option \`${name}\` is required.`, 'MissingOptionError');
                }
                recursiveOptions = recursiveOptions[name];
            }
        } else if (options[optionName] === undefined) {
            InterfaceErrorMessageService.logError({
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
    ensureProperty(options: Object, optionName: string) {
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
    getPropertyOrDefault(propertyPath: string, obj: Object) {
        return [obj].concat(propertyPath.split('.')).reduce((prev, curr) => (prev === undefined ? undefined : prev[curr]));
    },

    assertArgumentNotFalsy(argumentValue: any, argumentName: string) {
        if (!argumentValue) {
            this.throwError(`Argument \`${argumentName}\` is falsy.`, 'ArgumentFalsyError');
        }
    },

    throwError(message?: string, name?: string) {
        const error = new Error(message);
        error.name = name || 'Error';

        InterfaceErrorMessageService.logError(error);
    },

    throwInvalidOperationError(message?: string) {
        this.throwError(message || 'Invalid operation', 'InvalidOperationError');
    },

    throwFormatError(message?: string) {
        this.throwError(message || 'Invalid format', 'FormatError');
    },

    throwArgumentError(message?: string) {
        this.throwError(message || 'Invalid argument', 'ArgumentError');
    }
};
