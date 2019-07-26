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
                id: '2.q',
                name: '*VerticalLayout*',
                isContainer: true,
                childrenAttribute: 'rows',
                childrens: []
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
                        id: '3.3',
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
                                name: 'item2',
                                required: true
                            },
                            {
                                id: '4.3',
                                name: 'item3',
                                isHidden: true
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
                id: '2.hh',
                name: 'HorizontalLayout',
                isContainer: true,
                childrenAttribute: 'columns',
                childrens: [
                    {
                        id: '2.7x',
                        name: 'VerticalLayout',
                        isContainer: true,
                        childrenAttribute: 'columns',
                        type: 'unNamed',
                        childrens: [
                            {
                                id: '3.7g',
                                name: '7Dog'
                            },
                            {
                                id: '3.7h',
                                name: '7Cat'
                            },
                            {
                                id: '3.7n',
                                name: '7Cow'
                            }
                        ]
                    },
                    {
                        id: '2.x',
                        name: 'VerticalLayout',
                        isContainer: true,
                        childrenAttribute: 'columns',
                        type: 'unNamed',
                        childrens: [
                            {
                                id: '3.6',
                                name: 'tab9',
                                isContainer: true,
                                childrenAttribute: 'rows',
                                childrens: [
                                    {
                                        id: '4.11',
                                        name: 'xxx'
                                    },
                                    {
                                        id: '4.12',
                                        name: 'vvv'
                                    },
                                    {
                                        id: '4.13',
                                        name: 'sss'
                                    },
                                    {
                                        id: '4.14',
                                        name: 'iii'
                                    }
                                ]
                            },
                            {
                                id: '3.7',
                                name: 'tab10',
                                isContainer: true,
                                childrenAttribute: 'rows',
                                childrens: [
                                    {
                                        id: '4.21',
                                        name: 'uuu'
                                    },
                                    {
                                        id: '4.22',
                                        name: 'zzz'
                                    },
                                    {
                                        id: '4.23',
                                        name: 'lll'
                                    },
                                    {
                                        id: '4.24',
                                        name: 'ttt'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: '2.zzz',
                        name: 'VerticalLayout',
                        isContainer: true,
                        childrenAttribute: 'columns',
                        type: 'unNamed',
                        childrens: [
                            {
                                id: '3.1g',
                                name: 'Dog'
                            },
                            {
                                id: '3.1h',
                                name: 'Cat'
                            },
                            {
                                id: '3.1n',
                                name: 'Cow'
                            },
                            {
                                id: '3.16',
                                name: 'tab19',
                                isContainer: true,
                                childrenAttribute: 'rows',
                                childrens: [
                                    {
                                        id: '4.211',
                                        name: '111'
                                    },
                                    {
                                        id: '4.212',
                                        name: '222'
                                    },
                                    {
                                        id: '4.213',
                                        name: '333'
                                    },
                                    {
                                        id: '4.214',
                                        name: '444'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: '2.3',
                name: 'Genious',
                isContainer: true,
                visible: false,
                childrenAttribute: 'columns',
                childrens: [
                    {
                        id: '3.13',
                        name: 'Pasha'
                    },
                    {
                        id: '3.14',
                        name: 'Tony'
                    }
                ]
            },
            {
                id: '2.4',
                name: 'Average',
                isContainer: true,
                visible: false,
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
            const { id, name, isContainer, childrenAttribute, childrens, type, required, isHidden, visible } = options;
            const model = new Backbone.Model({
                name
            });
            if (childrenAttribute) {
                model.childrenAttribute = childrenAttribute;
                model.set(childrenAttribute, new Backbone.Collection(childrens));
            }
            if (required != null) {
                model.set({ required });
            }
            if (isHidden != null) {
                model.set({ isHidden });
            }
            if (visible != null) {
                model.set({ visible });
            }
            type && model.set({ type });
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

    const getNodeName = model => {
        return model.get('name');
    };

    const view = new Core.components.TreeEditor({
        model: createTreeModel(tree),
        getNodeName,
        unNamedType: 'unNamed',
        showToolbar: true,
        childsFilter: child => child.model.get('visible') !== false,
        configDiff: {"2.q":{"index":0},"2.2":{"index":1},"2.hh":{"index":2},"2.1":{"index":3},"3.2":{"index":0},"3.1":{"index":1}}
    });
    console.log(view.getDiffConfig());
    view.listenTo(view, 'save', config => console.log(config));
    view.listenTo(view, 'reset', () => console.log('reseted'));

    return view;
}
