import list from 'list';

export default function(options) {
    const columns = [
        {
            key: 'name',
            type: 'ExtendedString',
            title: 'TextCell',
            sorting: 'asc',
            width: 380
        }
    ];

    return list.factory.createDefaultGrid({
        gridViewOptions: {
            columns,
            selectableBehavior: 'multi',
            isTree: true,
            childrenAttribute: 'children',
            showHeader: false,
            expandOnShow: false,
            class: 'compact',
            maxHeight: '400px'
        },
        collection: options.model.get('context')
    });
}
