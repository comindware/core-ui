import { formComponentTypes } from 'Meta';

const isContainer = item => item.type && [
    formComponentTypes.verticalLayout,
    formComponentTypes.horizontalLayout,
    formComponentTypes.tabs,
    formComponentTypes.group
].includes(item.type);

export default class FormSchemaFactory {
    static getSchema(schema: Array<any>) {
        const schemaPlain = {};
        this.__fillConfiguration(schema, schemaPlain);

        return schemaPlain;
    }

    static __fillConfiguration(schemaTree: Array<any>, schemaPlain: Object) {
        schemaTree.forEach(item => {
            if (isContainer(item)) {
                this.__fillConfiguration(item.items, schemaPlain);
            } else if (item.key) {
                if (!/editor|field/.test(item.type)) {
                    console.warn('Unexpected "key" property for non editor|field configuration', item);
                }
                schemaPlain[item.key] = Object.assign(_.omit(item, ['key']), { type: item.type.replace('-field', '').replace('-editor', '') })
            }
        });
    }
};
