
export default {
    getSchema(schema) {
        const schemaPlain = {};
        this.__fillConfiguration(schema, schemaPlain);

        return schemaPlain;
    },

    __fillConfiguration(schemaTree, schemaPlain) {
        schemaTree.forEach(item => {
            item.type = item.type.replace('-field', '').replace('-editor', '');

            item.key
                ? schemaPlain[item.key] = _.omit(item, ['key'])
                : item.type.indexOf('container') !== -1 && this.__fillConfiguration(item.items, schemaPlain);
        });
    }
};
