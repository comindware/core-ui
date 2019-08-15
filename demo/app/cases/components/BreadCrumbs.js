

export default function() {
    return new Core.components.BreadCrumbs({
        collection: [
            {
                id: 1,
                name: 'First step',
                subname: 'First step',
                collection: [
                    {
                        id: 1,
                        name: 'First step'
                    },
                    {
                        id: 1,
                        name: 'First step'
                    }
                ]
            },
            {
                id: 2,
                name: 'Second step',
                subname: 'First step',
                collection: [
                    {
                        id: 1,
                        name: 'First step'
                    },
                    {
                        id: 1,
                        name: 'First step'
                    }
                ]
            },
            {
                id: 3,
                name: 'Third step',
                subname: 'First step',
                collection: [
                    {
                        id: 1,
                        name: 'First step'
                    },
                    {
                        id: 1,
                        name: 'First step'
                    }
                ]
            },
            {
                id: 4,
                name: 'First step',
                subname: 'First step',
                collection: [
                    {
                        id: 1,
                        name: 'First step'
                    },
                    {
                        id: 1,
                        name: 'First step'
                    }
                ]
            },
            {
                id: 5,
                name: 'First step',
                subname: 'First step',
                collection: [
                    {
                        id: 1,
                        name: 'First step'
                    },
                    {
                        id: 1,
                        name: 'First step'
                    }
                ]
            }
        ],
        title: 'Drawer demo'
    });
}
