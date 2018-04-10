import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default () => {
    // 1. Get some data
    const dataArray = [];
    for (let i = 0; i < 100; i++) {
        dataArray.push({
            textCell: `Text Cell ${i}`,
            numberCell: i + 1,
            dateTimeCell: '2015-07-24T08:13:13.847Z',
            durationCell: 'P12DT5H42M',
            booleanCell: true,
            userCell: [{ id: 'user.1', columns: ['J. J.'] }],
            referenceCell: { name: 'Ref 1' },
            enumCell: { valueExplained: ['123'] },
            documentCell: [
                {
                    id: `document.${i}`,
                    name: `Document ${i}`,
                    url: `GetDocument/${i}`
                }
            ]
        });
    }

    // 2. Create columns
    const columns = [
        {
            key: 'textCell',
            type: 'String',
            editor: 'Text',
            title: 'TextCell',
            required: true,
            viewModel: new Backbone.Model({ displayText: 'TextCell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
            sorting: 'asc',
            editable: true
        },
        {
            key: 'numberCell',
            type: 'Integer',
            editor: 'Number',
            title: 'Number Cell',
            getReadonly: model => model.get('numberCell') % 2,
            viewModel: new Backbone.Model({ displayText: 'Number Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Asc, 'numberCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Desc, 'numberCell'),
            editable: true
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            editor: 'DateTime',
            title: 'DateTime Cell',
            getHidden: model => model.get('numberCell') % 2,
            viewModel: new Backbone.Model({ displayText: 'DateTime Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Asc, 'dateTimeCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Desc, 'dateTimeCell'),
            editable: true
        },
        {
            key: 'durationCell',
            type: 'Duration',
            editor: 'Duration',
            title: 'Duration Cell',
            viewModel: new Backbone.Model({ displayText: 'Duration Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Asc, 'durationCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Desc, 'durationCell'),
            editable: true
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            editor: 'Boolean',
            title: 'Boolean Cell',
            viewModel: new Backbone.Model({ displayText: 'Boolean Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'booleanCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'booleanCell'),
            editable: true
        },
        {
            key: 'documentCell',
            type: 'Document',
            editor: 'Document',
            title: 'Document',
            viewModel: new Backbone.Model({ displayText: 'Boolean Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'documentCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'documentCell'),
            editable: true
        },
        {
            key: 'referenceCell',
            type: 'Instance',
            editor: 'Datalist',
            title: 'Reference Cell',
            controller: new core.form.editors.reference.controllers.DemoReferenceEditorController(),
            viewModel: new Backbone.Model({ displayText: 'Boolean Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'referenceCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'referenceCell'),
            editable: true
        }
    ];

    const collection = new Backbone.Collection(dataArray);

    // 3. Create grid
    const gridController = new core.list.controllers.GridController({
        columns,
        selectableBehavior: 'multi',
        showToolbar: true,
        showSearch: true,
        showSelection: true,
        showHeader: false,
        collection,
        title: 'Editable grid'
    });

    const handleAction = (action, items) => {
        switch (action.id) {
            case 'add':
                collection.add({
                    textCell: 'New item'
                });
                break;
            case 'delete':
                collection.remove(items);
                break;
            default:
                break;
        }
    }
    gridController.on('execute', handleAction);

    // 4. Show created views
    return new CanvasView({
        view: gridController.view,
        canvas: {
            height: '250px',
            width: '400px'
        },
        region: {
            float: 'left'
        }
    });
};
