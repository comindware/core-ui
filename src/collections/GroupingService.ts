const getNormalizedGroupingIterator = function getNormalizedGroupingIterator(groupingOptions) {
    const it = groupingOptions.iterator;
    return typeof it === 'string'
        ? function(model) {
              return model.get(it) || model[it];
          }
        : it;
};

const getNormalizedGroupingComparator = function getNormalizedGroupingComparator(groupingOptions) {
    const cmp = groupingOptions.comparator;
    return cmp !== undefined
        ? typeof cmp === 'string'
            ? function(model) {
                  return model.get(cmp) || model[cmp];
              }
            : cmp
        : groupingOptions.iterator;
};

const getNormalizedGroupingModelFactory = function getNormalizedGroupingModelFactory(groupingOptions) {
    const modelFactory = groupingOptions.modelFactory;
    return modelFactory !== undefined
        ? typeof modelFactory === 'string'
            ? function(model) {
                  return new Backbone.Model({
                      displayText: model.get(modelFactory),
                      groupingModel: true
                  });
              }
            : modelFactory
        : function(model) {
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
    if (typeof groupingOptions.iterator === 'string') {
        groupingOptions.affectedAttributes.push(groupingOptions.iterator);
    }
    if (typeof groupingOptions.comparator === 'string') {
        groupingOptions.affectedAttributes.push(groupingOptions.comparator);
    }
    if (typeof groupingOptions.modelFactory === 'string') {
        groupingOptions.affectedAttributes.push(groupingOptions.modelFactory);
    }
    groupingOptions.affectedAttributes = _.uniq(groupingOptions.affectedAttributes);

    groupingOptions.iterator = getNormalizedGroupingIterator(groupingOptions);
    groupingOptions.comparator = getNormalizedGroupingComparator(groupingOptions);
    groupingOptions.modelFactory = getNormalizedGroupingModelFactory(groupingOptions);
    groupingOptions.__normalized = true;
}
