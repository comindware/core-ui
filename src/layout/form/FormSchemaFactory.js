
export default {
    getSchema(schema) {
        const schemaPlain = {};
        this.__fillConfiguration(schema, schemaPlain);

        return schemaPlain;
    },

    __fillConfiguration(schemaTree, schemaPlain) {
        schemaTree.forEach(item => {
            item.key
                ? schemaPlain[item.key] = _.omit(item, ['key', 'cType'])
                : this.__fillConfiguration(item.items, schemaPlain);
        });
    }
};
