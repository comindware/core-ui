export default {
    translitePrimer: new Map([
        ['А', 'A'],  ['а', 'a'],  ['Б', 'B'],   ['б', 'b'],  ['В', 'V'],   ['в', 'v'],   ['Г', 'G'],  ['г', 'g'],
        ['Д', 'D'],  ['д', 'd'],  ['Е', 'E'],   ['е', 'e'],  ['Ё', 'Yo'],  ['ё', 'yo'],  ['Ж', 'Zh'], ['ж', 'zh'],
        ['З', 'Z'],  ['з', 'z'],  ['И', 'I'],   ['и', 'i'],  ['Й', 'Y'],   ['й', 'y'],   ['К', 'K'],  ['к', 'k'],
        ['Л', 'L'],  ['л', 'l'],  ['М', 'M'],   ['м', 'm'],  ['Н', 'N'],   ['н', 'n'],   ['О', 'O'],  ['о', 'o'],
        ['П', 'P'],  ['п', 'p'],  ['Р', 'R'],   ['р', 'r'],  ['С', 'S'],   ['с', 's'],   ['Т', 'T'],  ['т', 't'],
        ['У', 'U'],  ['у', 'u'],  ['Ф', 'F'],   ['ф', 'f'],  ['Х', 'Kh'],  ['х', 'kh'],  ['Ц', 'Ts'], ['ц', 'ts'],
        ['Ч', 'Ch'], ['ч', 'ch'], ['Ш', 'Sh'],  ['ш', 'sh'], ['Щ', 'Sch'], ['щ', 'sch'], ['Ъ', '"'],  ['ъ', '"'],
        ['Ы', 'Y'],  ['ы', 'y'],  ['Ь', "'"],   ['ь', "'"],  ['Э', 'E'],   ['э', 'e'],   ['Ю', 'Yu'], ['ю', 'yu'],
        ['Я', 'Ya'], ['я', 'ya'], [' ', '_'],   ['Ä', 'A'],  ['ä', 'a'],   ['É', 'E'],   ['é', 'e'],  ['Ö', 'O'],
        ['ö', 'o'],  ['Ü', 'U'],  ['ü', 'u'],   ['ß', 's']
    ]),

    initializeTransliteration(options) {
        if (options.schema) {
            if (this.isShemaNew(options.schema)) {
                options.schema = this.setOptionsToFieldsOfNewSchema(options.schema, options.transliteratedFields, options.inputSettings);
            } else {
                this.setOptionsToComputedTransliteratedFields(options.schema, options.transliteratedFields, options.inputSettings);
            }
        }
        if (options.model) {
            this.extendComputed(options.model, options.transliteratedFields, options.schema);
            options.model.computedFields = new Backbone.ComputedFields(options.model);
        }
        return {
            schema: options.schema,
            model: options.model,
            transliteratedFields: options.transliteratedFields
        }
    },

    setOptionsToComputedTransliteratedFields(schema, transliteratedFields = {name: 'alias'}, inputSettings = {
            changeMode: 'blur',
            autocommit: true,
            forceCommit: true,
            transliteratorChangedSomeProperties: true
        }) {
        let computedRelatedFields = Object.values(transliteratedFields);
        computedRelatedFields = computedRelatedFields.concat(Object.keys(transliteratedFields).filter(name => !(schema[name] && schema[name].allowEmptyValue)));

        computedRelatedFields.forEach((input) => {
            if (!schema[input]) {
                console.warn(`Transliterator: schema has no input '${input}'`);
                return;
            }
            Object.keys(inputSettings).forEach((propetry) => {
                if (schema[input][propetry] !== undefined && !schema[input].transliteratorChangedSomeProperties) {
                    console.warn(`Transliterator: Property '${propetry}' of input '${input}' was overwritten`);
                }
            });
            Object.assign(schema[input], inputSettings);
        });

        return schema;
    },

    setOptionsToFieldsOfNewSchema(newSchema, transliteratedFields, inputSettings) {
        const changedSchemaOldType = this.setOptionsToComputedTransliteratedFields(this.mapNewSchemaToOld(newSchema), transliteratedFields, inputSettings);
        return this.mapOldSchemaToNew(changedSchemaOldType);
    },

    isShemaNew(schema) {
        return Array.isArray(schema);
    },

    mapNewSchemaToOld(newSchema) {
        return newSchema.reduce((oldShema, input) => {
            oldShema[input.key] = _.omit(input, 'key');
            return oldShema;
        }, {});
    },

    mapOldSchemaToNew(oldShema) {
        return Object.entries(oldShema).map(keyValue => {
            keyValue[1].key = keyValue[0];
            return keyValue[1]
        });
    },  

    systemNameFiltration(string) {
        if (!string) {
            return '';
        }
        const str = this.translite(string);

        let firstIsDigit = true;
        const nonLatinReg = /[^a-zA-Z_]/g;
        const nonLatinDigitReg = /[^a-zA-Z0-9_]/g;

        return Array.from(str).map(char => {
            firstIsDigit && (firstIsDigit = nonLatinReg.test(char));
            return char.replace(firstIsDigit ? nonLatinReg : nonLatinDigitReg, '')
        }).join('');
    },

    getTranslitToSystemName() {
        if (!this.__translitToSystemName) {
            this.__translitToSystemName = Object.create(null);

            this.translitePrimer.forEach((value, key) => {
                const err = Core.form.repository.validators.systemName()(value);
                this.__translitToSystemName[key] = err ? '' : value;
            });
        }

        return this.__translitToSystemName;
    },

    extendComputed(model, transliteratedFields = {name: 'alias'}, schema = {}) {
        const computed = model.computed = model.computed || {};

        const required = function(name) {
            return function(fields) {
                if (fields[name]) {
                    return fields[name];
                }
                return this.previous(name);
            };
        };
        const getTranslite = (name, alias) =>
            (fields) => {
                if (fields[alias]) {
                    return this.systemNameFiltration(fields[alias]);
                }
                return this.systemNameFiltration(fields[name]);
            };

        Object.entries(transliteratedFields).forEach((keyValue) => {
            const name = keyValue[0];
            const alias = keyValue[1];

            if (computed[name] && !computed[name].transliteratedFieldsClass) {
                console.error(`Transliterator: computed is not fully extended, computed[${name}] is exist in model!`);
                return;
            }
            if (computed[alias] && !computed[alias].transliteratedFieldsClass) {
                console.error(`Transliterator: computed is not fully extended, computed[${alias}] is exist in model!`);
                return;
            }

            if (!(schema[name] && schema[name].allowEmptyValue)) {
                computed[name] = {
                    depends: [name],
                    get: required(name),
                    transliteratedFieldsClass: 'name' //flag for separate from original computed
                };
            }

            computed[alias] = {
                depends: [name, alias],
                get: getTranslite(name, alias),
                transliteratedFieldsClass: 'alias'
            };
        });

        return model;
    },

    translite(text) {
        return String(text).replace(/[а-яё]/gi, ruChar => this.getTranslitToSystemName()[ruChar] || '');
    }    
}
