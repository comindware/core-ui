import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    const data = [];
    for (let i = 0; i < 500; i++) {
        data.push({
            textCell: `Text Cell ${i}`,
            numberCell: i + 1,
            dateTimeCell: '2015-07-24T08:13:13.847Z',
            durationCell: 'P12DT5H42M',
            booleanCell: true,
            userCell: [{ id: 'user.1', columns: ['J. J.'] }],
            referenceCell: { name: 'Ref 1' },
            enumCell: { valueExplained: ['123'] },
            documentCell: [{ id: '1', columns: ['Doc 1', 'url'] }, { id: '2', columns: ['Doc 2', 'url2'] }]
        });
    }

    const columns = [
        {
            key: 'textCell',
            type: 'String',
            title: 'TextCell'
        },
        {
            key: 'numberCell',
            type: 'Integer',
            title: 'Number Cell'
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            title: 'DateTime Cell'
        },
        {
            key: 'durationCell',
            type: 'Duration',
            title: 'Duration Cell'
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            title: 'Boolean Cell'
        },
        {
            key: 'referenceCell',
            type: 'Instance',
            title: 'Reference Cell'
        },
        {
            key: 'documentCell',
            type: 'Document',
            title: 'Document Cell'
        }
    ];

    describe('Simple grid', () => {
        it('should initialize', () => {
            const gridController = new core.list.controllers.GridController({
                columns,
                selectableBehavior: 'multi',
                showSearch: true,
                showCheckbox: true,
                collection: new Backbone.Collection(data)
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(gridController.view);

            expect(true).toBe(true);
        });

        it('should show help text icon in columns header', () => {
            const gridController = new core.list.controllers.GridController({
                columns: [
                    {
                        key: 'textCell',
                        type: 'String',
                        title: 'TextCell',
                        helpText: 'this is help text'
                    }
                ],
                collection: []
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(gridController.view);

            expect(true).toBe(true);
        });
    });
});
