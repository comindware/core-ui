export default function() {
    const tree = {
        id: '1',
        name: 'Root',
        isContainer: true,
        childrenAttribute: 'rows',
        childrens: [
            {
                id: '1.1',
                name: 'First single item'
            },
            {
                id: '1.1a',
                name: 'Single item'
            },
            {
                id: '1.1b',
                name: 'Another single item'
            },
            {
                id: '1.2',
                name: '*VerticalLayout*',
                isContainer: true,
                childrenAttribute: 'rows',
                childrens: []
            },
            {
                id: '1.3',
                name: 'Tabs',
                isContainer: true,
                childrenAttribute: 'tabs',
                childrens: [
                    {
                        id: '1.3.1',
                        name: 'tab1'
                    },
                    {
                        id: '1.3.2',
                        name: 'tab2'
                    },
                    {
                        id: '1.3.3',
                        name: 'tab3',
                        isContainer: true,
                        childrenAttribute: 'rows',
                        childrens: [
                            {
                                id: '1.3.3.1',
                                name: 'item1'
                            },
                            {
                                id: '1.3.3.2',
                                name: 'item2',
                                required: true
                            },
                            {
                                id: '1.3.3.3',
                                name: 'item3',
                                isHidden: true
                            },
                            {
                                id: '1.3.3.4',
                                name: 'item4'
                            }
                        ]
                    }
                ]
            },
            {
                id: '1.4',
                name: 'HorizontalLayout',
                isContainer: true,
                childrenAttribute: 'columns',
                childrens: [
                    {
                        id: '1.4.1',
                        name: 'VerticalLayout',
                        isContainer: true,
                        childrenAttribute: 'columns',
                        type: 'unNamed',
                        childrens: [
                            {
                                id: '1.4.1.1',
                                name: '7Dog'
                            },
                            {
                                id: '1.4.1.2',
                                name: '7Cat'
                            },
                            {
                                id: '1.4.1.3',
                                name: '7Cow'
                            }
                        ]
                    },
                    {
                        id: '1.4.2',
                        name: 'VerticalLayout',
                        isContainer: true,
                        childrenAttribute: 'columns',
                        type: 'unNamed',
                        childrens: [
                            {
                                id: '1.4.2.1',
                                name: 'tab9',
                                isContainer: true,
                                childrenAttribute: 'rows',
                                type: 'hasController',
                                childrens: [
                                    {
                                        id: '1.4.2.1.1',
                                        name: 'xxx'
                                    },
                                    {
                                        id: '1.4.2.1.2',
                                        name: 'vvv'
                                    },
                                    {
                                        id: '1.4.2.1.3',
                                        name: 'sss'
                                    },
                                    {
                                        id: '1.4.2.1.4',
                                        name: 'iii'
                                    }
                                ]
                            },
                            {
                                id: '1.4.2.2',
                                name: 'tab10',
                                isContainer: true,
                                childrenAttribute: 'rows',
                                childrens: [
                                    {
                                        id: '1.4.2.2.1',
                                        name: 'uuu'
                                    },
                                    {
                                        id: '1.4.2.2.2',
                                        name: 'zzz'
                                    },
                                    {
                                        id: '1.4.2.2.3',
                                        name: 'lll'
                                    },
                                    {
                                        id: '1.4.2.2.4',
                                        name: 'ttt'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: '1.4.3',
                        name: 'VerticalLayout',
                        isContainer: true,
                        childrenAttribute: 'columns',
                        type: 'unNamed',
                        childrens: [
                            {
                                id: '1.4.3.1',
                                name: 'Dog'
                            },
                            {
                                id: '1.4.3.2',
                                name: 'Cat'
                            },
                            {
                                id: '1.4.3.3',
                                name: 'Cow'
                            },
                            {
                                id: '1.4.3.4',
                                name: 'tab19',
                                isContainer: true,
                                childrenAttribute: 'rows',
                                childrens: [
                                    {
                                        id: '1.4.3.4.1',
                                        name: '111'
                                    },
                                    {
                                        id: '1.4.3.4.2',
                                        name: '222'
                                    },
                                    {
                                        id: '1.4.3.4.3',
                                        name: '333'
                                    },
                                    {
                                        id: '1.4.3.4.4',
                                        name: '444'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: '1.5',
                name: 'Genious',
                isContainer: true,
                visible: false,
                childrenAttribute: 'columns',
                childrens: [
                    {
                        id: '1.5.1',
                        name: 'Pasha'
                    },
                    {
                        id: '1.5.2',
                        name: 'Stas'
                    },
                    {
                        id: '1.5.3',
                        name: 'Vlad'
                    }
                ]
            },
            {
                id: '1.6',
                name: 'Below average',
                isContainer: true,
                visible: false,
                childrenAttribute: 'columns',
                childrens: [
                    {
                        id: '1.6.1',
                        name: 'Tony'
                    }
                ]
            },
            {
                id: '1.7',
                name: 'Some single item'
            },
            {
                id: '1.8',
                name: 'Penultimate item'
            },
            {
                id: '1.9',
                name: 'Last single item'
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
            model.id = id || _.unique('id');

            return model;
        }
    }

    const createTreeModel = treeObj => {
        if (treeObj.isContainer) {
            treeObj.childrens = treeObj.childrens.map(node => createTreeModel(node));
        }

        return new TreeNode(treeObj);
    };

    const getNodeName = model => model.get('name');

    const treeEditor = new Core.components.TreeEditor({
        model: createTreeModel(tree),
        getNodeName,
        unNamedType: 'unNamed',
        showToolbar: true,
        childsFilter: child => child.model.get('visible') !== false,
        nestingOptions: { hasControllerType: 'hasController' },
        configDiff: new Map([
            ['1.3', { index: 1, isHidden: true }],
            ['1.1a', { index: 2 }],
            ['1.1b', { index: 3 }],
            ['1.2', { index: 4 }],
            ['1.8', { isHidden: true }],
            ['1.4', { isHidden: true }]
        ])
    });
    const view = treeEditor.getView();
    console.log(treeEditor.getConfigDiff());
    view.listenTo(view, 'save', config => console.log(`saved: ${config}`));
    view.listenTo(view, 'reset', () => console.log('reseted'));

    return view;
}
