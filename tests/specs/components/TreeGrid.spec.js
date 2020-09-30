import core from 'coreApi';
import 'jasmine-jquery';
const $ = Backbone.$;

let gridController;
describe('Components', () => {
    const data = [];
    const childLength = 3;
    
    const treeHeight = 4;

    const createTree = (parentCollection, level, parent = null) => {
        for (let i = 0; i < childLength; i++) {
            const item = {
                initialIndex: i,
                textCell: `Text Cell ${i}`,
                numberCell: i + 1,
                dateTimeCell: '2015-07-24T08:13:13.847Z',
                durationCell: 'P12DT5H42M',
                booleanCell: true,
                userCell: [{ id: 'user.1', columns: ['J. J.'] }],
                referenceCell: { name: 'Ref 1' },
                enumCell: { valueExplained: ['123'] },
                documentCell: [
                    { id: '1', columns: ['Doc 1', 'url'] },
                    { id: '2', columns: ['Doc 2', 'url2'] }
                ]
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

    const columns = [
        {
            key: 'textCell',
            type: 'String',
            title: 'TextCell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
            sorting: 'asc',
            width: 300
        },
        {
            key: 'numberCell',
            type: 'Double',
            title: 'Number Cell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Asc, 'numberCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Desc, 'numberCell'),
            sorting: 'asc',
            width: 100
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            title: 'DateTime Cell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Asc, 'dateTimeCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Desc, 'dateTimeCell'),
            width: 100
        },
        {
            key: 'durationCell',
            type: 'Duration',
            title: 'Duration Cell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Asc, 'durationCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Desc, 'durationCell'),
            width: 100
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            title: 'Boolean Cell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'booleanCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'booleanCell'),
            width: 100
        },
        {
            key: 'referenceCell',
            type: 'Instance',
            title: 'Reference Cell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Asc, 'referenceCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Desc, 'referenceCell'),
            width: 100
        },
        {
            key: 'documentCell',
            type: 'Document',
            title: 'Document Cell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Asc, 'documentCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Desc, 'documentCell'),
            width: 100
        }
    ];

    const beforeEachTest = () => {
        gridController = core.list.factory.createDefaultGrid({
            gridViewOptions: {
                columns,
                selectableBehavior: 'multi',
                isTree: true,
                childrenAttribute: 'children'
            },
            collection: data
        });

        window.app
            .getView()
            .getRegion('contentRegion')
            .show(gridController);

        expect(true).toBe(true);
    };
    const expandOnShowTest = () => {
        gridController = core.list.factory.createDefaultGrid({
            gridViewOptions: {
                columns,
                selectableBehavior: 'multi',
                isTree: true,
                expandOnShow: true,
                childrenAttribute: 'children'
            },
            collection: new Backbone.Collection(data)
        });

        window.app
            .getView()
            .getRegion('contentRegion')
            .show(gridController);

        expect(true).toBe(true);
    };

    describe('EditableGrid', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });
        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('isTree on click', () => {
            beforeEachTest();
            const tabs = $('tbody > tr:nth-child(1) > td:nth-child(1)> i');
            const listBefore = $('tbody > tr');

            tabs.click();
            jasmine.clock().tick(1000);
            const listAfter = $('tbody > tr');
            expect(listAfter.length).not.toBe(listBefore.length);
        });
        it('isTree all on click', () => {
            beforeEachTest();
            const tabs = $('.grid-header> td:first-child >div > i:first-child');
            const listBefore = $('tbody > tr');

            $(tabs).trigger('pointerdown');
            jasmine.clock().tick(1000);
            const listAfter = gridController.collection;
            expect(listAfter.length).not.toBe(listBefore.length);
            expect(listAfter.length).toBe(363);
        });
        it('expand on show', () => {
            expandOnShowTest();
            const listBefore = gridController.collection;
            expect(listBefore.length).toBe(363);
        });
    });
});
