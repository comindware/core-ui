export default function() {
    const tree = {
        id: '1',
        name: 'Root',
        isContainer: true,
        childrenAttribute: 'rows',
        childrens: [
            {
                id: '2.1',
                name: 'Single item'
            },
            {
                id: '2.2',
                name: 'Tabs',
                isContainer: true,
                childrenAttribute: 'tabs',
                childrens: [
                    {
                        id: '3.1',
                        name: 'tab1'
                    },
                    {
                        id: '3.2',
                        name: 'tab2'
                    },
                    {
                        id: '3.5',
                        name: 'tab3',
                        isContainer: true,
                        childrenAttribute: 'rows',
                        childrens: [
                            {
                                id: '4.1',
                                name: 'item1'
                            },
                            {
                                id: '4.2',
                                name: 'item2'
                            },
                            {
                                id: '4.3',
                                name: 'item3'
                            },
                            {
                                id: '4.4',
                                name: 'item4'
                            }
                        ]
                    }
                ]
            },
            {
                id: '2.3',
                name: 'Genious',
                isContainer: true,
                childrenAttribute: 'columns',
                childrens: [
                    {
                        id: '3.3',
                        name: 'Pasha'
                    },
                    {
                        id: '3.4',
                        name: 'Tony'
                    }
                ]
            },
            {
                id: '2.4',
                name: 'Average',
                isContainer: true,
                childrenAttribute: 'columns',
                childrens: [
                    {
                        id: '3.5',
                        name: 'Stas'
                    },
                    {
                        id: '3.6',
                        name: 'Vlad'
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

    const view = new Core.components.TreeEditor({ model: createTreeModel(tree), eyeIconClass: 'cat', closedEyeIconClass: 'plus' });
    view.on('save', config => console.log(config));

    return view;
}
