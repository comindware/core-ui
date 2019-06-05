const tree = {
    id: '1',
    name: '--root--',
    isContainer: true,
    childrenAttribute: 'rows',
    childrens: [
        {
            id: '2.1',
            name: '--text--'
        },
        {
            id: '2.2',
            name: '--tabs--',
            isContainer: true,
            childrenAttribute: 'tabs',
            childrens: [
                {
                    id: '3.1',
                    name: 'item1'
                },
                {
                    id: '3.2',
                    name: 'item2'
                },
                {
                    id: '3.5',
                    name: '--rows--',
                    isContainer: true,
                    childrenAttribute: 'rows',
                    childrens: [
                        {
                            id: '4.1',
                            name: 'lebel4_1'
                        },
                        {
                            id: '4.2',
                            name: 'lebel4_2'
                        }
                    ]
                }
            ]
        },
        {
            id: '2.3',
            name: '--columns--',
            isContainer: true,
            childrenAttribute: 'columns',
            childrens: [
                {
                    id: '3.3',
                    name: 'hello1'
                },
                {
                    id: '3.4',
                    name: 'hello2'
                }
            ]
        }
    ]
};

class TreeNode {
    constructor(options) {
        const { id, name, isContainer, childrenAttribute, childrens } = options;
        const model = new Backbone.Model({
            name
        });
        if (childrenAttribute) {
            model.childrenAttribute = childrenAttribute;
            model.set(childrenAttribute, new Backbone.Collection(childrens));
        }
        isContainer && (model.isContainer = isContainer);
        model.id = id;

        return model;
    }
}

const createTreeModel = treeObj => {
    if (treeObj.isContainer) {
        treeObj.childrens = treeObj.childrens.map(node => createTreeModel(node));
    }

    return new TreeNode(treeObj);
};

export default function() {
    return new Core.components.TreeEditor({ model: createTreeModel(tree) });
}
