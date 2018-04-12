// @flow
export default {
    getSchema(schema: Array<any>) {
        const schemaPlain = {};
        this.__fillConfiguration(schema, schemaPlain);

        return schemaPlain;
    },

    __fillConfiguration(schemaTree: Array<any>, schemaPlain: Object) {
        schemaTree.forEach(item => {
            item.type.includes('container')
                ? this.__fillConfiguration(item.items, schemaPlain)
                : (schemaPlain[item.key] = Object.assign(_.omit(item, ['key']), { type: item.type.replace('-field', '').replace('-editor', '') }));
        });
    }
};
