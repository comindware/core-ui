import core from 'coreApi';
import 'jasmine-jquery';

function reverseString(string) {
    return string.split('').reverse().join('');
}

const transliterator = Core.utils.transliterator;
const validator = core.form.repository.validators.systemName();

const asciiString = String.fromCharCode(...(new Array(Math.pow(2, 16))).fill(1).map((el, i) => i));

const ruChar = 'г';
const enChar = 'u';
const underscore = '_';
const number = '3';
const correctAlias = '_alias1234';
const ruName = 'Иван Иванович';

const Model = Backbone.Model.extend({
    initialize() {
        transliterator.extendComputed(this);
        this.computedFields = new Backbone.ComputedFields(this);
    },
});

const schema = {
    name: {
        type: 'Text',
        title: 'Text',
        helpText: 'Some help information',
        changeMode: 'keydown',
        autocommit: false,
        forceCommit: false
    },
    alias: {
        type: 'Text',
        title: 'Alias',
        helpText: 'Some help information',
        changeMode: 'keydown',
        autocommit: false,
        forceCommit: false
    },
    number: {
        type: 'Number',
        title: 'Number',
        helpText: 'Some help information'
    },
    dateTime: {
        type: 'DateTime',
        title: 'DateTime',
        helpText: 'Some help information'
    },
    duration: {
        type: 'Duration',
        title: 'Duration',
        helpText: 'Some help information'
    },
    dropdown: {
        type: 'Datalist',
        title: 'Dropdown',
        collection: [
            { id: 'd.1', text: 'Text 1' },
            { id: 'd.2', text: 'Text 2' },
            {
                id: 'd.3',
                text: 'Text 3'
            },
            { id: 'd.4', text: 'Text 4' }
        ],
        helpText: 'Some help information'
    }
};

describe('Transliterator:', () => {
    it('correctAlias should be correct, ruName should be uncorrect', () => {
        const errAlias = validator(correctAlias);
        const errName = validator(ruName);

        expect(Boolean(errAlias)).toEqual(false);
        expect(Boolean(errName)).toEqual(true);
    });

    it('systemNameFiltration should return correct alias', () => {
        const resultWoNumber = transliterator.systemNameFiltration(asciiString);
        const resultWithNumber = transliterator.systemNameFiltration(reverseString(asciiString));

        expect(resultWoNumber.includes(ruChar)).toEqual(false);
        expect(resultWoNumber.includes(enChar)).toEqual(true);
        expect(resultWoNumber.includes(underscore)).toEqual(true);
        expect(resultWoNumber.includes(number)).toEqual(false);

        expect(resultWithNumber.includes(ruChar)).toEqual(false);
        expect(resultWithNumber.includes(enChar)).toEqual(true);
        expect(resultWithNumber.includes(underscore)).toEqual(true);
        expect(resultWithNumber.includes(number)).toEqual(true);

        expect(Boolean(validator(resultWoNumber))).toEqual(false);
        expect(Boolean(validator(resultWithNumber))).toEqual(false);
    });

    it('setOptionsToComputedTransliteratedFields (default) should return schema with correct value to name and alias input of schema. should throw warn owerwritten', () => {
        const originalWarn = console.warn;
        const messages = [];
        console.warn = function(string) {
            messages.push(string);
        };
        const instance = _.cloneDeep(schema);
        transliterator.setOptionsToComputedTransliteratedFields(instance);

        expect(instance.name.changeMode).toEqual('blur');
        expect(instance.name.autocommit).toEqual(true);
        expect(instance.name.forceCommit).toEqual(true);
        expect(instance.name.transliteratorChangedSomeProperties).toEqual(true);
        expect(instance.alias.changeMode).toEqual('blur');
        expect(instance.alias.autocommit).toEqual(true);
        expect(instance.alias.forceCommit).toEqual(true);
        expect(instance.alias.transliteratorChangedSomeProperties).toEqual(true);

        expect(messages.length).toEqual(6);
        console.warn = originalWarn;
    });

    it('setOptionsToComputedTransliteratedFields should return schema with correct value to transliteratedFields input of schema', () => {
        const instance = _.cloneDeep(schema);
        transliterator.setOptionsToComputedTransliteratedFields(instance, { dateTime: 'duration' });

        expect(instance.name.changeMode).toEqual('keydown');
        expect(instance.name.autocommit).toEqual(false);
        expect(instance.name.forceCommit).toEqual(false);
        expect(instance.name.transliteratorChangedSomeProperties).toEqual(undefined);
        expect(instance.alias.changeMode).toEqual('keydown');
        expect(instance.alias.autocommit).toEqual(false);
        expect(instance.alias.forceCommit).toEqual(false);
        expect(instance.alias.transliteratorChangedSomeProperties).toEqual(undefined);

        expect(instance.dateTime.changeMode).toEqual('blur');
        expect(instance.dateTime.autocommit).toEqual(true);
        expect(instance.dateTime.forceCommit).toEqual(true);
        expect(instance.dateTime.transliteratorChangedSomeProperties).toEqual(true);
        expect(instance.duration.changeMode).toEqual('blur');
        expect(instance.duration.autocommit).toEqual(true);
        expect(instance.duration.forceCommit).toEqual(true);
        expect(instance.duration.transliteratorChangedSomeProperties).toEqual(true);
    });

    it('setOptionsToComputedTransliteratedFields should return object in first arguments', () => {
        const instance = _.cloneDeep(schema);
        const returned = transliterator.setOptionsToComputedTransliteratedFields(instance, { dateTime: 'duration' });

        expect(returned).toEqual(instance);
    });

    it('extendComputed should return correct computed for Backbone.ComputedFields', () => {
        const model = new Model({
            name: ruName,
            alias: correctAlias
        });

        expect(model.get('alias')).toEqual(correctAlias);
        expect(model.get('name')).toEqual(ruName);
    });

    it('extendComputed should return object in first arguments', () => {
        const model = new Backbone.Model();
        const returned = transliterator.extendComputed(model);

        expect(returned).toEqual(model);
    });

    it('Model should transliterate alias if null, don`t transliterate if not empty', () => {
        const model = new Model({
            name: 'Иван Иванович',
            alias: ''
        });

        expect(Boolean(model.get('alias'))).toEqual(true);

        model.set('alias', correctAlias);

        expect(model.get('alias')).toEqual(correctAlias);
    });

    it('Model should take name for alias if name is correct alias', () => {
        const model = new Model({
            name: correctAlias,
            alias: ''
        });

        expect(model.get('name')).toEqual(correctAlias);
        expect(model.get('alias')).toEqual(correctAlias);
    });

    it('Model should correct transliterate name if alias is empty', () => {
        const model = new Model({
            name: ruName,
            alias: ''
        });

        const answer = transliterator.systemNameFiltration(ruName);

        expect(model.get('alias')).toEqual(answer);
    });
    
    it('Model should correct transliterate alias if alias is ru', () => {
        const model = new Model({
            name: correctAlias,
            alias: ruName
        });

        const answer = transliterator.systemNameFiltration(ruName);

        expect(model.get('alias')).toEqual(answer);
        expect(model.get('name')).toEqual(correctAlias);
    });

    it('should throw warn if schema has no input for transliterated fields', () => {
        const originalWarn = console.warn;
        const messages = [];
        console.warn = string => messages.push(string);

        const instance = _.cloneDeep(schema);
        transliterator.setOptionsToComputedTransliteratedFields(instance, { unknown: 'nonexistent'});

        expect(instance.unknown).toEqual(undefined);
        expect(instance.nonexistent).toEqual(undefined);

        expect(messages.length).toEqual(2);
        console.warn = originalWarn;
    });

    it('should not set computed to model if model has original computed alias, throw warning', () => {
        const model = new Backbone.Model({
            name: ruName,
            alias: correctAlias
        });

        model.computed = {
            alias: {
                depends: 'name',
                get: function(fields) {
                    if (fields[name]) {
                        return fields[name];
                    }
                    return fields[alias];
                },
                someFlag: true
            }
        };

        const originalWarn = console.warn;
        const messages = [];
        console.warn = string => messages.push(string);

        transliterator.extendComputed(model);

        expect(model.computed.name).toEqual(undefined);
        expect(model.computed.alias.someFlag).toEqual(true);
        expect(model.computed.alias.transliteratedFieldsClass).toEqual(undefined);       

        expect(messages.length).toEqual(1);
        console.warn = originalWarn;
    });
    
    it('should not set computed to model if model has original computed name, throw warning', () => {
        const model = new Backbone.Model({
            name: ruName,
            alias: correctAlias
        });

        model.computed = {
            name: {
                depends: 'alias',
                get: function(fields) {
                    if (fields[name]) {
                        return fields[name];
                    }
                    return fields[alias];
                },
                someFlag: true
            }
        };

        const originalWarn = console.warn;
        const messages = [];
        console.warn = string => messages.push(string);

        transliterator.extendComputed(model);

        expect(model.computed.alias).toEqual(undefined);
        expect(model.computed.name.someFlag).toEqual(true);
        expect(model.computed.name.transliteratedFieldsClass).toEqual(undefined);       

        expect(messages.length).toEqual(1);
        console.warn = originalWarn;
    });

    it('should not systemNameFiltration typed value if returnRawValue = true in schema for this input', () => {
        const model = new Backbone.Model({
            name: ruName,
            alias: correctAlias
        });

        const schema = {
            name: {
                type: 'Text',
                title: 'Text',
                helpText: 'Some help information'
            },
            alias: {
                type: 'Text',
                title: 'Alias',
                helpText: 'Some help information',
                returnRawValue: true
            }
        };

        transliterator.initializeTransliteration({ model, schema });

        model.set('alias', ruName);

        expect(model.get('alias')).toEqual(ruName);
    });

    it('should systemNameFiltration typed value if returnRawValue = undefined in schema for this input', () => {
        const model = new Backbone.Model({
            name: ruName,
            alias: 'someValue'
        });

        const schema = {
            name: {
                type: 'Text',
                title: 'Text',
                helpText: 'Some help information'
            },
            alias: {
                type: 'Text',
                title: 'Alias',
                helpText: 'Some help information'
            }
        };

        transliterator.initializeTransliteration({ model, schema });

        model.set('alias', ruName);

        expect(model.get('alias')).toEqual(transliterator.systemNameFiltration(ruName));
    });
});
