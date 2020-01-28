export default {
    getSchema(schema: Array<any>) {
        const schemaPlain = {};
        this.__fillConfiguration(schema, schemaPlain);

        return schemaPlain;
    },

    __fillConfiguration(schemaTree: Array<any>, schemaPlain: Object) {
        schemaTree.forEach(item => {
            if (item.type && (item.type.includes('container') || item.type.includes('group'))) {
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
