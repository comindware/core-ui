import 'jasmine-jquery';

const $ = Backbone.$;
let gridView;
describe('Components', () => {
    describe('Grid tests', () => {
        beforeEach(() => {
            const dataArray = [];
            for (let i = 0; i < 15; i++) {
                dataArray.push({
                    initialIndex: i,
                    textCell: 'Text Cell '.concat(i),
                    htmlCell: '<div>Test 1</div><div>Test 2</div>',
                    numberCell: i + 1,
                    dateTimeCell: '2015-07-24T08:13:13.847Z',
                    durationCell: 'P12DT5H42M',
                    booleanCell: true,
                    userCell: {
                        id: 'user.1',
                        name: 'Nicola Tesla',
                        avatarUrl: 'images/image2.jpg'
                    },
                    referenceCell: {
                        id: '1',
                        name: 'Ref 1',
                        url: 'url2'
                    },
                    documentCell: {
                        id: '1',
                        name: 'Doc 1',
                        url: 'url1'
                    },
                    enumCell: {
                        valueExplained: ['123']
                    },
                    textCell1: ['Text Cell '.concat(i), 'Text Cell '.concat(i + 1)],
                    numberCell1: [i + 1, i + 2],
                    dateTimeCell1: ['2015-07-24T08:13:13.847Z', '2016-07-24T08:13:13.847Z'],
                    durationCell1: ['P12DT5H42M', 'P22DT5H42M'],
                    booleanCell1: [true, false],
                    userCell1: {
                        id: 'user.1',
                        name: 'Nicola Tesla',
                        avatarUrl: 'images/image2.jpg'
                    },
                    referenceCell1: {
                        id: '1',
                        name: 'Ref 1',
                        url: 'url2'
                    },
                    documentCell1: {
                        id: '1',
                        name: 'Doc 1',
                        url: 'url1'
                    }
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
                    key: 'userCell',
                    type: 'Account',
                    title: 'User'
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
                },
                {
                    key: 'textCell1',
                    type: 'String',
                    title: 'TextCell'
                },
                {
                    key: 'numberCell1',
                    type: 'Integer',
                    title: 'Number Cell'
                },
                {
                    key: 'dateTimeCell1',
                    type: 'DateTime',
                    title: 'DateTime Cell'
                },
                {
                    key: 'durationCell1',
                    type: 'Duration',
                    title: 'Duration Cell'
                },
                {
                    key: 'userCell1',
                    type: 'Account',
                    title: 'User'
                },
                {
                    key: 'booleanCell1',
                    type: 'Boolean',
                    title: 'Boolean Cell'
                },
                {
                    key: 'referenceCell1',
                    type: 'Instance',
                    title: 'Reference Cell'
                },
                {
                    key: 'documentCell1',
                    type: 'Document',
                    title: 'Document Cell'
                },
                {
                    key: 'htmlCell',
                    type: 'String',
                    format: 'HTML',
                    title: 'HTML  Cell'
                }
            ];
            gridView = new Core.list.GridView({
                columns,
                selectableBehavior: 'multi',
                showSearch: true,
                showCheckbox: true,
                collection: new Backbone.Collection(dataArray)
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(gridView);
            expect(true).toBe(true);
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });
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
        it('first row hasChecked/notHasChecked', () => {
            const headerList = $('.grid-header > td:first-child');
            expect(headerList[0].className).not.toBe('hasChecked');
            headerList[0].firstElementChild.click();
            expect(headerList[0].className).toContain('hasChecked');
        });
        it('list row not has Checked', () => {
            const list = $('tbody > tr');
            for (let i = 0; i < list.length; i++) {
                expect(list[i].className).not.toContain('row-checked');
            }
        });
        it('list row has Checked', () => {
            const headerList = $('.grid-header > td:first-child');
            const list = $('tbody > tr');
            headerList[0].firstElementChild.click();
            for (let i = 0; i < list.length; i++) {
                expect(list[i].className).toContain('row-checked');
            }
        });
        it('row should checked on click', () => {
            const list = $('tbody > tr');
            const checkBox = $('tbody > tr > td:first-child');
            for (let i = 0; i < list.length; i++) {
                expect(list[i].className).not.toContain('row-checked');
                $(checkBox[i].firstElementChild).trigger('pointerdown');
                expect(list[i].className).toContain('row-checked');
            }
        });
        it('row should not checked on click', () => {
            const list = $('tbody > tr');
            const checkBox = $('tbody > tr > td:first-child');
            for (let i = 0; i < list.length; i++) {
                $(checkBox[i].firstElementChild).trigger('pointerdown');
            }
            for (let i = 0; i < list.length; i++) {
                expect(list[i].className).toContain('row-checked');
                $(checkBox[i].firstElementChild).trigger('pointerdown');
                expect(list[i].className).not.toContain('row-checked');
            }
        });
        it('sorting on click', () => {
            //$x('//tbody/tr/td[contains(@title,"Text")]');
            const textName = $('tbody > tr> td:nth-child(2)');
            const headerCheckBox = $('.grid-header > td:nth-child(2) > div > div:first-child');
            const beforeText = [];
            headerCheckBox.click();
            const afterText = [];
            for (let i = 0; i < textName.length; i++) {
                beforeText.push(textName[i].innerText);
            }
            beforeText.reverse();

            headerCheckBox.click();
            const textAfterName = $('tbody > tr> td:nth-child(2)');
            for (let i = 0; i < textAfterName.length; i++) {
                afterText.push(textAfterName[i].innerText);
            }
            expect(beforeText.length).toBe(textAfterName.length);
            for (let i = 0; i < textAfterName.length; i++) {
                afterText.push(textAfterName[i].innerText);
                expect(beforeText[i]).toBe(afterText[i]);
            }
        });

        it('sorting on click by Number Cell', () => {
            const headerCheckBox = $('.grid-header > td:nth-child(3) > div > div:first-child');

            const firstColumnSortAsc = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
            const firstColumnSortDesc = firstColumnSortAsc.concat().reverse();

            headerCheckBox.click();
            gridView.collection.forEach((model, index) => {
                expect(model.get('initialIndex')).toBe(firstColumnSortAsc[index]);
            });
            headerCheckBox.click();
            gridView.collection.forEach((model, index) => {
                expect(model.get('initialIndex')).toBe(firstColumnSortDesc[index]);
            });
        });
        it('sorting on click by TextCell', () => {
            const headerCheckBox = $('.grid-header > td:nth-child(2) > div > div:first-child');

            const firstColumnSortAsc = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
            const firstColumnSortDesc = firstColumnSortAsc.concat().reverse();

            headerCheckBox.click();
            gridView.collection.forEach((model, index) => {
                expect(model.get('initialIndex')).toBe(firstColumnSortAsc[index]);
            });
            headerCheckBox.click();
            gridView.collection.forEach((model, index) => {
                expect(model.get('initialIndex')).toBe(firstColumnSortDesc[index]);
            });
        });
        it('sorting on click by DateTime Cell', () => {
            const headerCheckBox = $('.grid-header > td:nth-child(4) > div > div:first-child');

            const firstColumnSortAsc = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
            const firstColumnSortDesc = firstColumnSortAsc.concat().reverse();

            headerCheckBox.click();
            gridView.collection.forEach((model, index) => {
                expect(model.get('initialIndex')).toBe(firstColumnSortAsc[index]);
            });
            headerCheckBox.click();
            expect(gridView.collection.at(0).get('initialIndex')).not.toBe(firstColumnSortDesc[0]);
        });
        it('sorting on click by Duration Cell', () => {
            const headerCheckBox = $('.grid-header > td:nth-child(5) > div > div:first-child');

            const firstColumnSortAsc = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
            const firstColumnSortDesc = firstColumnSortAsc.concat().reverse();

            headerCheckBox.click();
            gridView.collection.forEach((model, index) => {
                expect(model.get('initialIndex')).toBe(firstColumnSortAsc[index]);
            });
            headerCheckBox.click();
            expect(gridView.collection.at(0).get('initialIndex')).not.toBe(firstColumnSortDesc[0]);
        });
        it('visible grid', () => {
            const list = $('tbody > tr:first-child');
            expect(Math.ceil(list.height())).toBe(35); //
        });
        it('input search has focused', () => {
            const selectedInput = 'focused';
            const search = $('.tr-search ');
            expect(search[0].className).toContain(selectedInput);
        });
        it('sorting input search', () => {
            const row = $('tbody > tr');
            const search = $('input');
            search.click();
            search.val('text cell 15');
            const e = $.Event('keyup');
            e.keyCode = 13;
            search.trigger(e);
            jasmine.clock().tick(1000);
            const rowAfter = $('tbody > tr');
            expect(rowAfter.length).not.toBe(row.length);
        });
    });
});
