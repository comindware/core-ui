import 'jasmine-jquery';

const $ = Backbone.$;

describe('Components', () => {
    const dataArray = [];
    for (let i = 0; i < 15; i++) {
        dataArray.push({
            textCell: 'Text Cell '.concat(i),
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
        }
    ];
    const gridController = new Core.list.GridView({
        columns,
        selectableBehavior: 'multi',
        showSearch: true,
        showCheckbox: true,
        collection: new Backbone.Collection(dataArray)
    });

    describe('Grid tests', () => {
        beforeEach(() => {
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(gridController);
            expect(true).toBe(true);
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
    });
});
