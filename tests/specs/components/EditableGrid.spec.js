import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Components', () => {
    beforeEach(function () {
        this.rootRegion = initializeCore();
    });

    const data = [];
    for (let i = 0; i < 5000; i++) {
        data.push({
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

    const columns = [
        {
            key: 'textCell',
            type: 'Text',
            title: 'TextCell',
            required: true,
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
            sorting: 'asc',
            editable: true
        },
        {
            key: 'numberCell',
            type: 'Number',
            title: 'Number Cell',
            getReadonly: model => model.get('numberCell') % 2,
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Asc, 'numberCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Desc, 'numberCell'),
            editable: true
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            title: 'DateTime Cell',
            getHidden: model => model.get('numberCell') % 2,
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Asc, 'dateTimeCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Desc, 'dateTimeCell'),
            editable: true
        },
        {
            key: 'durationCell',
            type: 'Duration',
            title: 'Duration Cell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Asc, 'durationCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Desc, 'durationCell'),
            editable: true
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            title: 'Boolean Cell',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'booleanCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'booleanCell'),
            editable: true
        },
        {
            key: 'documentCell',
            type: 'Document',
            title: 'Document',
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'documentCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'documentCell'),
            editable: true
        },
        {
            key: 'referenceCell',
            type: 'Datalist',
            title: 'Reference Cell',
            controller: new core.form.editors.reference.controllers.DemoReferenceEditorController(),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'referenceCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'referenceCell'),
            editable: true
        }
    ];

    const excludeActions = ['archive', 'unarchive'];
    const additionalActions = [
        {
            id: 'void',
            name: 'void',
            contextType: core.list.meta.contextTypes.void
        },
        {
            id: 'any',
            name: 'any',
            contextType: core.list.meta.contextTypes.any
        },
        {
            id: 'one',
            name: 'one',
            contextType: core.list.meta.contextTypes.one
        }
    ];

    describe('EditableGrid', () => {
        it('should initialize', function () {
            const collection = new Backbone.Collection(data);

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

            this.rootRegion.show(gridController.view);

            expect(true).toBe(true);
        });

        it('should search when typing in search box', function (done) {
            const collection = new Backbone.Collection(data);

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

            this.rootRegion.show(gridController.view);

            gridController.view.listView.collection.on('change', () => {
                expect(gridController.view.listView.collection.length).toEqual(1111);
                done();
            });

            const searchInput = document.getElementsByClassName('js-search-input')[0];

            searchInput.value = 'Text Cell 1';

            gridController.view.$(searchInput).trigger('keyup');
        });

        it('should update toolbar on row checkbox select', function (done) {
            const collection = new Backbone.Collection(data);

            const gridController = new core.list.controllers.GridController({
                columns,
                selectableBehavior: 'multi',
                showToolbar: true,
                showSearch: true,
                showSelection: true,
                showHeader: false,
                collection,
                title: 'Editable grid',
                excludeActions,
                additionalActions
            });

            this.rootRegion.show(gridController.view);

            const firstChechbox = gridController.view.$('.checkbox:eq(1)');
            const secondChechbox = gridController.view.$('.checkbox:eq(2)');
            const gridCollection = gridController.view.collection;
            const allItemsCollection = gridController.view.toolbarView.allItemsCollection;
            const checkSomeCallback = jasmine.createSpy('checkSomeCallback');
            gridCollection.on('check:some', checkSomeCallback);


            const firstObserver = new MutationObserver(() => {
                expect(firstChechbox[0].classList.contains('editor_checked')).toBe(true);
            });

            firstObserver.observe(firstChechbox[0], {
                attributes: true,
                attributeFilter: ['class'],
                childList: false,
                characterData: false
            });

            const secondObserver = new MutationObserver(() => {
                expect(secondChechbox[0].classList.contains('editor_checked')).toBe(true);
            });

            secondObserver.observe(secondChechbox[0], {
                attributes: true,
                attributeFilter: ['class'],
                childList: false,
                characterData: false
            });

            allItemsCollection.on('update:child:top', () => {
                expect(checkSomeCallback).toHaveBeenCalledTimes(1);
                expect(gridController.view.toolbarView.allItemsCollection.length).toBe(4);
                done();
            });

            firstChechbox.click();
            secondChechbox.click();
        });
    });
});
