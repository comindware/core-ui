//@flow
const getNormalizedGroupingIterator = function getNormalizedGroupingIterator(groupingOptions) {
    const it = groupingOptions.iterator;
    return _.isString(it)
        ? function (model) {
            return model.get(it) || model[it];
        }
        : it;
};

const getNormalizedGroupingComparator = function getNormalizedGroupingComparator(groupingOptions) {
    const cmp = groupingOptions.comparator;
    return cmp !== undefined
        ? _.isString(cmp)
            ? function (model) {
                return model.get(cmp) || model[cmp];
            }
            : cmp
        : groupingOptions.iterator;
};

const getNormalizedGroupingModelFactory = function getNormalizedGroupingModelFactory(groupingOptions) {
    const modelFactory = groupingOptions.modelFactory;
    return modelFactory !== undefined
        ? _.isString(modelFactory)
            ? function (model) {
                return new Backbone.Model({
                    displayText: model.get(modelFactory),
                    groupingModel: true
                });
            }
            : modelFactory
        : function (model) {
            return new Backbone.Model({
                displayText: groupingOptions.iterator(model),
                groupingModel: true
            });
        };
};

export default function fixGroupingOptions(groupingOptions) {
    if (groupingOptions.__normalized) {
        return;
    }
    if (!groupingOptions.affectedAttributes) {
        groupingOptions.affectedAttributes = [];
    }
    if (_.isString(groupingOptions.iterator)) {
        groupingOptions.affectedAttributes.push(groupingOptions.iterator);
    }
    if (_.isString(groupingOptions.comparator)) {
        groupingOptions.affectedAttributes.push(groupingOptions.comparator);
    }
    if (_.isString(groupingOptions.modelFactory)) {
        groupingOptions.affectedAttributes.push(groupingOptions.modelFactory);
    }
    groupingOptions.affectedAttributes = _.uniq(groupingOptions.affectedAttributes);

    groupingOptions.iterator = getNormalizedGroupingIterator(groupingOptions);
    groupingOptions.comparator = getNormalizedGroupingComparator(groupingOptions);
    groupingOptions.modelFactory = getNormalizedGroupingModelFactory(groupingOptions);
    groupingOptions.__normalized = true;
}
