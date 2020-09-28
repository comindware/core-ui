import core from 'coreApi';
import 'jasmine-jquery';

let gridController;
const $ = Backbone.$;

describe('Components', () => {
    const data = [];
    for (let i = 0; i < 10; i++) {
        data.push({
            textCell: `Text Cell ${i}`,
            numberCell: i + 1,
            dateTimeCell: '2015-07-24T08:13:13.847Z',
            durationCell: 'P12DT5H42M',
            booleanCell1: [true, false],
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
            validators: ['required'],
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
            collection: new core.form.editors.reference.collections.DemoReferenceCollection(),
            fetchFiltered: true,
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'referenceCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'referenceCell'),
            editable: true
        }
    ];

    const dependantColumns = [
        {
            key: 'textCell',
            type: 'Text',
            title: 'TextCell',
            getReadonly: model => model.get('booleanCell'),
            editable: true
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            title: 'Boolean Cell',
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
        beforeEach(() => {
            const collection = new Backbone.Collection(data);
            gridController = new Core.list.GridView({
                columns,
                selectableBehavior: 'multi',
                showToolbar: true,
                showSearch: true,
                showCheckbox: true,
                collection,
                title: 'Editable grid'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(gridController);

            expect(true).toBe(true);
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        /* xit('should search when typing in search box', () => {
            gridController.listView.collection.on('change', () => {
                expect(gridController.listView.collection.length).toEqual(1110);
            });

            const searchInput = document.getElementsByClassName('js-search-input')[0];

            searchInput.value = 'Text Cell 1';

            gridController.$(searchInput).trigger('keyup');
        }); */

        it('should selected on click', () => {
            const selectedList = 'selected';
            const list = $('tbody > tr');
            for (let i = 0; i < list.length; i++) {
                list[i].click();
                expect(list[i].className).toContain(selectedList);
            }
        });
        it('next row deselected', () => {
            const list = $('tbody > tr');
            for (let i = 0; i < list.length; i++) {
                list[i].click();
                if (i < list.length - 1) {
                    expect(list[i].className).not.toBe(list[i + 1].className);
                }
            }
        });
        it('prev row deselected', () => {
            const list = $('tbody > tr');
            for (let i = 0; i < list.length; i++) {
                list[i].click();
                if (i !== 0) {
                    expect(list[i].className).not.toBe(list[i - 1].className);
                }
            }
        });
        it('cell focused on click by Text Cell', () => {
            const cell = $('tbody > tr> td:nth-child(2)');

            for (let i = 0; i < 10; i++) {
                cell[i].click();
                jasmine.clock().tick(100);
                const list = $('tbody > tr');
                const cellName = $('tbody > tr > td:nth-child(2)');
                expect(cellName[i].className).toContain('cell-focused');
                expect(list[i].className).toContain('selected');
                expect(cellName[i].firstElementChild.className).toContain('editor');
            }
        });
        it('cell focused on click by Duration Cell', () => {
            const cell = $('tbody > tr> td:nth-child(5)');

            for (let i = 0; i < 10; i++) {
                cell[i].click();
                jasmine.clock().tick(100);
                const list = $('tbody > tr');
                const cellName = $('tbody > tr > td:nth-child(5)');
                expect(cellName[i].className).toContain('cell-focused');
                expect(list[i].className).toContain('selected');
                expect(cellName[i].firstElementChild.className).toContain('editor');
            }
        });
        it('cell focused on click by Reference Cell', () => {
            const cell = $('tbody > tr> td:nth-child(8)');

            for (let i = 0; i < 10; i++) {
                cell[i].click();
                jasmine.clock().tick(100);
                const list = $('tbody > tr');
                const cellName = $('tbody > tr > td:nth-child(8)');
                expect(cellName[i].className).toContain('cell-focused');
                expect(list[i].className).toContain('selected');
                expect(cellName[i].firstElementChild.className).toContain('editor');
                const numberCell = $('tbody > tr > td:nth-child(2)');
                if (i < 9) {
                    numberCell[i].click();
                    jasmine.clock().tick(100);
                }
            }
        });
        it('cell editor/readonly on click by Number Cell', () => {
            const cell = $('tbody > tr> td:nth-child(3)');

            for (let i = 0; i < 10; i++) {
                cell[i].click();
                jasmine.clock().tick(100);
                const list = $('tbody > tr');
                const cellName = $('tbody > tr > td:nth-child(3)');
                expect(cellName[i].className).toContain('cell-focused');
                expect(list[i].className).toContain('selected');
                if (cellName[i].className.indexOf('readonly') !== -1) {
                    expect(cellName[i].firstElementChild).toBe(null);
                } else {
                    expect(cellName[i].firstElementChild.className).toContain('editor');
                }
            }
        });
        it('cell editor/readonly on click by DateTime Cell', () => {
            const cell = $('tbody > tr> td:nth-child(4)');

            for (let i = 0; i < 10; i++) {
                cell[i].click();
                jasmine.clock().tick(100);
                const list = $('tbody > tr');
                const cellName = $('tbody > tr > td:nth-child(4)');
                expect(cellName[i].className).toContain('cell-focused');
                expect(list[i].className).toContain('selected');
                if (cellName[i].className.indexOf('readonly') !== -1) {
                    expect(cellName[i].firstElementChild).toBe(null);
                } else {
                    expect(cellName[i].firstElementChild.className).toContain('editor');
                }

                const numberCell = $('tbody > tr > td:nth-child(2)');
                if (i < 9) {
                    numberCell[i].click();
                    jasmine.clock().tick(100);
                }
            }
        });
        it('cell editing', () => {
            const cell = $('tbody > tr> td:nth-child(2)');
            const textBefore = [];
            const textAfter = [];
            for (let i = 0; i < 10; i++) {
                textBefore.push(cell[i].innerText);
            }
            for (let i = 0; i < 10; i++) {
                cell[i].click();
                jasmine.clock().tick(100);
                const input = $('tbody > tr> td:nth-child(2)> div>input');

                input.val(`test ${i}`);
                input.trigger('change');
                $('tbody > tr> td:nth-child(3)')[0].click();
            }
            const cellAfter = $('tbody > tr> td:nth-child(2)');
            for (let i = 0; i < 10; i++) {
                textAfter.push(cellAfter[i].innerText);
            }
            for (let i = 0; i < textBefore.length; i++) {
                expect(textAfter[i]).toContain(`test ${i}`);
                expect(textAfter[i]).not.toBe(textBefore[i]);
            }
        });
        it('Number cell editing', () => {
            const cell = $('tbody > tr> td:nth-child(3)');
            const textBefore = [];
            const textAfter = [];
            for (let i = 0; i < 10; i++) {
                if (cell[i].className.indexOf('readonly') !== -1) {
                    textBefore.push(`${cell[i].innerText} readonly`);
                } else {
                    textBefore.push(cell[i].innerText);
                }
            }
            for (let i = 0; i < 10; i++) {
                if (cell[i].className.indexOf('readonly') !== -1) {
                    cell[i].click();
                    jasmine.clock().tick(100);
                    expect(cell[i].firstElementChild).toBe(null);
                } else {
                    cell[i].click();
                    jasmine.clock().tick(100);
                    const input = $('tbody > tr> td:nth-child(3)> div>input');

                    input.val(+cell[i].innerText * 10);
                    input.trigger('change');
                }
                $('tbody > tr> td:nth-child(2)')[0].click();
            }
            const cellAfter = $('tbody > tr> td:nth-child(3)');
            for (let i = 0; i < 10; i++) {
                if (cellAfter[i].className.indexOf('readonly') !== -1) {
                    textAfter.push(`${cellAfter[i].innerText} readonly`);
                } else {
                    textAfter.push(cellAfter[i].innerText);
                }
            }
            for (let i = 0; i < cell.length; i++) {
                expect(cell.length).toBe(cellAfter.length);
                if (cell[i].className.indexOf('readonly') !== -1) {
                    expect(textBefore[i]).toBe(textAfter[i]);
                } else {
                    expect(+textBefore[i]).toBe(textAfter[i] / 10);
                }
            }
        });
        it('required validation cell ', () => {
            const cell = $('tbody > tr> td:nth-child(2)');

            for (let i = 0; i < 10; i++) {
                cell[i].click();
                jasmine.clock().tick(100);
                const input = $('tbody > tr> td:nth-child(2)> div>input');

                input.val(``);
                input.trigger('change');
                $('tbody > tr> td:nth-child(3)')[0].click();
            }
            const cellAfter = $('tbody > tr> td:nth-child(2)');
            const cellNumber = $('tbody > tr> td:nth-child(3)');

            const mouse = document.createEvent('MouseEvents');
            mouse.initMouseEvent('mousedown', true, true, window);

            for (let i = 0; i < cellAfter.length; i++) {
                expect(cellAfter[i].className).toContain(`error`);
                cellAfter[i].firstElementChild.click();
                jasmine.clock().tick(100);
                let modal = $('.form-label__error-panel');
                expect(modal[0].firstElementChild.innerText).toContain(`This field is required`);

                cellNumber[i].dispatchEvent(mouse);
                jasmine.clock().tick(150);

                expect($('.js-global-popup-stack').length).toBe(1);
            }
        });
        fit('keyboard event', () => {
            const cell = $('tbody > tr> td:nth-child(2)');
            const cellNumber = $('tbody > tr> td:nth-child(3)');
            for (let i = 0; i < 10; i++) {
                const textBefore = cell[i].innerText;
                cell[i].click();
                jasmine.clock().tick(100);
                let input = $('tbody > tr> td:nth-child(2)> div>input');

                input.val(`test ${i}`);
                input.trigger('change');
                jasmine.clock().tick(100);

                let e = $.Event('keydown');
                e.keyCode = 9;

                input.trigger(e);

                const textAfter = $('tbody > tr> td:nth-child(2)')[i].innerText;
                expect(textBefore).not.toBe(textAfter);
                if (cellNumber[i].className.indexOf('readonly') !== -1) {
                    
                    expect(cellNumber[i].firstElementChild).toBe(null);
                } else {
                    jasmine.clock().tick(100);
                    e.key = 113;

                    $(cellNumber[i]).trigger(e); 
                    jasmine.clock().tick(300);
                    input = $('tbody > tr> td:nth-child(3)> div>input');

                    input.val(+cellNumber[i].innerText * 10);
                    input.trigger('change');
                    jasmine.clock().tick(300);
                }
                jasmine.clock().tick(100);
            }
        });
        /*
               it('should correctly apply access modificators', done => {
                   const collection = new Backbone.Collection(data);

                   const gridController = new Core.list.GridView({
                       columns: dependantColumns,
                       selectableBehavior: 'multi',
                       collection,
                       title: 'Editable grid'
                   });
                   const view = gridController.view;
                   window.app
                       .getView()
                       .getRegion('contentRegion')
                       .show(view);

                   const checkBox = document.querySelector('.editor_checkbox');
                   const textInput = document.querySelector('.editor .input_text');

                   expect(textInput.hasAttribute('readonly')).toEqual(true);

                   var observer = new MutationObserver(() => {
                       expect(textInput.hasAttribute('readonly')).toEqual(false);

                       Backbone.$(checkBox).click();

                       expect(textInput.hasAttribute('readonly')).toEqual(true);

                       this.disconnect();
                       done();
                   });

                   observer.observe(textInput, { attributes: true, childList: false, characterData: false });

                   Backbone.$(checkBox).click();
               });

               it('should update toolbar on row checkbox select', done => {
                   const collection = new Backbone.Collection(data);

                   const gridController = new Core.list.GridView({
                       columns,
                       selectableBehavior: 'multi',
                       showToolbar: true,
                       showSearch: true,
                       showCheckbox: true,
                       collection,
                       title: 'Editable grid',
                       excludeActions,
                       additionalActions
                   });

                   window.app
                       .getView()
                       .getRegion('contentRegion')
                       .show(gridController.view);

                   const firstChechbox = gridController.view.$('.checkbox:eq(1)');
                   const secondChechbox = gridController.view.$('.checkbox:eq(2)');
                   const gridCollection = gridController.view.collection;
                   const toolbarItems = gridController.view.toolbarView.toolbarItems;
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

                   toolbarItems.on('update:child:top', () => {
                       expect(checkSomeCallback).toHaveBeenCalledTimes(1);
                       expect(gridController.view.toolbarView.toolbarItems.length).toBe(4);
                       done();
                   });

                   firstChechbox.click();
                   secondChechbox.click();
               });
               */
    });
});
