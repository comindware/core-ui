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

    setOptionsToComputedRelatedFields(schema, relatedFields = {name: 'alias'}, options = {
            changeMode: 'blur',
            autocommit: true,
            forceCommit: true
        }) {
        const newSchema = Object.assign({}, schema);

        let computedRelatedFields = relatedFields;
        if (!Array.isArray(relatedFields)) {
            computedRelatedFields = [];
            Object.entries(relatedFields).forEach(keyVal =>
                keyVal.forEach(input =>
                    computedRelatedFields.push(input)
                )
            );
        }

        computedRelatedFields.forEach((input) => {
            Object.keys(options).forEach((propetry) => {
                if (schema[input][propetry]) {
                    console.warn(`Transliterator: Property '${propetry}' of input '${input}' was overwritten`);
                }
            });
            Object.assign(newSchema[input], options);
        });

        return newSchema;
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

    extendComputed(model, relatedFields = {name: 'alias'}) {
        const computed = model.computed || {};

        const required = (name) =>
            (fields) => {
                if (fields[name]) {
                    return fields[name];
                }
                return model.previous(name);
            };
        const getTranslite = (name, alias) =>
            (fields) => {
                if (fields[alias]) {
                    return fields[alias];
                }
                return this.systemNameFiltration(fields[name]);
            };

        Object.entries(relatedFields).forEach((keyValue) => {
            const name = keyValue[0];
            const alias = keyValue[1];

            if (computed[name] && !computed[name].relatedFieldsClass) {
                console.error(`Transliterator: computed is not fully extended, computed[${name}] is exist in model!`);
                return;
            }
            if (computed[alias] && !computed[alias].relatedFieldsClass) {
                console.error(`Transliterator: computed is not fully extended, computed[${alias}] is exist in model!`);
                return;
            }

            computed[name] = {
                depends: [name],
                get: required(name),
                relatedFieldsClass: 'name' //flag for separate from original computed
            };
            computed[alias] = {
                depends: [name, alias],
                get: getTranslite(name, alias),
                relatedFieldsClass: 'alias'
            };
        });

        return computed;
    },

    translite(text) {
        return String(text).replace(/[а-яё]/gi, ruChar => this.getTranslitToSystemName()[ruChar] || '');
    }    
}
