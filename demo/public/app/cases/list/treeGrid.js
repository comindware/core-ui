import CanvasView from 'demoPage/views/CanvasView';

// 1. Get some data
export default function () {
    const data = [];
    const childLength = 3;
    const treeHeight = 4;

    const createTree = (parentCollection, level, parent = null) => {
        for (let i = 0; i < childLength; i++) {
            const item = {
                textCell: `Text Cell ${i}`,
                numberCell: i + 1,
                dateTimeCell: '2015-07-24T08:13:13.847Z',
                durationCell: 'P12DT5H42M',
                booleanCell: true,
                userCell: [{ id: 'user.1', columns: ['J. J.'] }],
                referenceCell: { name: 'Ref 1' },
                enumCell: { valueExplained: ['123'] },
                documentCell: [{ id: '1', columns: ['Doc 1', 'url'] }, { id: '2', columns: ['Doc 2', 'url2'] }]
            };
            item.parent = parent;
            if (level > 0) {
                const children = [];
                createTree(children, level - 1, item);
                item.children = children;
            }
            parentCollection.push(item);
        }
    };

    createTree(data, treeHeight);

    // 2. Create columns
    const columns = [
        {
            key: 'textCell',
            type: 'String',
            title: 'TextCell',
            sorting: 'asc',
            width: 300
        },
        {
            key: 'numberCell',
            type: 'Double',
            title: 'Number Cell',
            width: 100
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            title: 'DateTime Cell',
            width: 100
        },
        {
            key: 'durationCell',
            type: 'Duration',
            title: 'Duration Cell',
            width: 100
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            title: 'Boolean Cell',
            width: 100
        },
        {
            key: 'referenceCell',
            type: 'Instance',
            title: 'Reference Cell',
            width: 100
        },
        {
            key: 'documentCell',
            type: 'Document',
            title: 'Document Cell',
            width: 100
        }
    ];

    // 3. Create grid
    const nativeGridView = Core.list.factory.createDefaultGrid({
        gridViewOptions: {
            columns,
            selectableBehavior: 'multi',
            isTree: true,
            childrenAttribute: 'children'
        },
        collection: data
    });

    // 4. Show created views
    return new CanvasView({
        view: nativeGridView,
        canvas: {
            height: '250px',
            width: '400px'
        },
        region: {
            float: 'left'
        }
    });
}
