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
        this.computed = transliterator.extendComputed(this);
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

    it('setOptionsToComputedTransliteratedFields (default) should return schema with correct value to name and alias input of schema', () => {
        const result = transliterator.setOptionsToComputedTransliteratedFields(schema);

        expect(schema.name.changeMode).toEqual('keydown');
        expect(schema.name.autocommit).toEqual(false);
        expect(schema.name.forceCommit).toEqual(false);
        expect(schema.name.transliteratorChangedSomeProperties).toEqual(undefined);
        expect(schema.alias.changeMode).toEqual('keydown');
        expect(schema.alias.autocommit).toEqual(false);
        expect(schema.alias.forceCommit).toEqual(false);
        expect(schema.alias.transliteratorChangedSomeProperties).toEqual(undefined);

        expect(result.name.changeMode).toEqual('blur');
        expect(result.name.autocommit).toEqual(true);
        expect(result.name.forceCommit).toEqual(true);
        expect(result.name.transliteratorChangedSomeProperties).toEqual(true);
        expect(result.alias.changeMode).toEqual('blur');
        expect(result.alias.autocommit).toEqual(true);
        expect(result.alias.forceCommit).toEqual(true);
        expect(result.alias.transliteratorChangedSomeProperties).toEqual(true);
    });

    
    it('setOptionsToComputedTransliteratedFields should return schema with correct value to transliteratedFields input of schema', () => {
        const result = transliterator.setOptionsToComputedTransliteratedFields(schema, { dateTime: 'duration' });

        expect(result.name.changeMode).toEqual('keydown');
        expect(result.name.autocommit).toEqual(false);
        expect(result.name.forceCommit).toEqual(false);
        expect(result.name.transliteratorChangedSomeProperties).toEqual(undefined);
        expect(result.alias.changeMode).toEqual('keydown');
        expect(result.alias.autocommit).toEqual(false);
        expect(result.alias.forceCommit).toEqual(false);
        expect(result.alias.transliteratorChangedSomeProperties).toEqual(undefined);

        expect(result.dateTime.changeMode).toEqual('blur');
        expect(result.dateTime.autocommit).toEqual(true);
        expect(result.dateTime.forceCommit).toEqual(true);
        expect(result.dateTime.transliteratorChangedSomeProperties).toEqual(true);
        expect(result.duration.changeMode).toEqual('blur');
        expect(result.duration.autocommit).toEqual(true);
        expect(result.duration.forceCommit).toEqual(true);
        expect(result.duration.transliteratorChangedSomeProperties).toEqual(true);
    });

    it('extendComputed should return correct computed for Backbone.ComputedFields', () => {
        const model = new Model({
            name: ruName,
            alias: correctAlias
        })
        expect(model.get('alias')).toEqual(correctAlias);
        expect(model.get('name')).toEqual(ruName);
    });

    it('Model should transliterate alias if null, don`t transliterate if not empty', () => {
        const model = new Model({
            name: 'Иван Иванович',
            alias: ''
        })

        expect(Boolean(model.get('alias'))).toEqual(true);

        model.set('alias', correctAlias);

        expect(model.get('alias')).toEqual(correctAlias);
    });

    it('Model should take name for alias if name is correct alias', () => {
        const model = new Model({
            name: correctAlias,
            alias: ''
        })

        expect(model.get('name')).toEqual(correctAlias);
        expect(model.get('alias')).toEqual(correctAlias);
    });

    it('Model should correct transliterate name if alias is empty', () => {
        const model = new Model({
            name: ruName,
            alias: ''
        })

        const answer = transliterator.systemNameFiltration(ruName);

        expect(model.get('alias')).toEqual(answer);
    });
    
    it('Model should correct transliterate alias if alias is ru', () => {
        const model = new Model({
            name: correctAlias,
            alias: ruName
        })

        const answer = transliterator.systemNameFiltration(ruName);

        expect(model.get('alias')).toEqual(answer);
        expect(model.get('name')).toEqual(correctAlias);
    });
});
