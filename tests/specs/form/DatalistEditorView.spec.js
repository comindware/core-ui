import core from 'coreApi';
import 'jasmine-jquery';
import 'jasmine-expect';
import { keyCode } from 'utils';
import FocusTests from './FocusTests';
import DemoReferenceCollection from 'form/editors/impl/datalist/collections/DemoReferenceCollection';

const controllerDelay = 300;

describe('Editors', () => {
    const getElement = (view, selector) => view.$(selector);
    const getButton = view => view.dropdownView.button.$el;
    const getBubble = (view, index) => getElement(view, `.bubbles__i:eq(${index})`);
    const getBubbleDelete = view => getElement(view, '.js-bubble-delete');
    const getItemOfList = index => getElement(Backbone, `.dd-list__i:eq(${index})`);
    const getTextElOfInputList = index => getElement(Backbone, `.dd-list__text:eq(${index})`);

    const getInput = view => getElement(view, '.js-input');

    const startSearch = (input, string) => {
        input.click();
        input.val(string);
        input.trigger('input');
    };

    const actionForOpen = view =>
        getInput(view)
            .focus();

    const wait = (options = {}) => {
        const first = setInterval(() => {
            typeof options.action === 'function' && options.action();
            if (typeof options.condition === 'function' ? options.condition() : true) {
                clearTimeout(first);
                typeof options.callback === 'function' && options.callback();
            }
        }, options.delay || 10);
    };

    const whatIsThat = value => Array.isArray(value) ? 'Array' : (value === null ? 'null' : typeof value);
    const stopped = delay => new Promise(resolve => setTimeout(resolve, delay));

    const show = view =>
        window.app
            .getView()
            .getRegion('contentRegion')
            .show(view);

    const collectionData3 = [
        {
            id: 1,
            name: 1
        },
        {
            id: 2,
            name: 2
        },
        {
            id: 3,
            name: 3
        }
    ];

    const arrayObjects15 = _.times(15, n => ({
        id: n,
        text: `Text ${n}`,
        subtext: `subtext ${n}`
    }));

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function sleep(fn, ...args) {
        await timeout(controllerDelay);
        return fn(...args);
    }

    afterEach(() => {
        core.services.WindowService.closePopup();
    });

    describe('DatalistEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    value: [{ id: 1, name: 1 }]
                });

                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    maxQuantitySelected: Infinity
                });

                return view;
            },
            focusElement: '.js-input'
        });

        it('should clean input value onblur', () => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            show(view);

            const input = getInput(view);

            startSearch(input, 'somesearch');
            expect(input.val()).toEqual('somesearch');
            view.blur();
            view.on('blur', () => {
                expect(input.val()).toEqual('');
            });
        });

        it('UI should match it configuration', () => {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should show error view if wrongly instantiated', () => {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should show error view with appropriate message and help text', () => {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should has `value` matched with initial value', () => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            show(view);

            expect(view.getValue()).toEqual([{ id: 1, name: 1 }]);
        });

        it('view panelVirtualcollection should filtered on dropdown open if input value changed (on initilize === empty string) and fetchFiltered = false', done => {
            //ToDo add test for fetchFiltered = true;
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: arrayObjects15,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            let counter = 0;

            view.panelCollection.on('filter', () => {
                counter++;
            });

            view.on('dropdown:open', () => {
                expect(counter).toEqual(1);
                done();
            });

            show(view);
            const input = getInput(view);
            input
                .val('some')
                .focus();
        });

        it('should has collection matched it static initial collection', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            view.on('dropdown:open', () => {
                expect(view.panelCollection.toJSON()).toEqual(collectionData3);
                done();
            });

            show(view);
            actionForOpen(view);
        });

        it('should has placeholder if model value == null, showSearch = true', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity,
                showSearch: true
            });

            show(view);

            view.on('dropdown:open', () => {
                expect(getInput(view)[0].getAttribute('placeholder') === 'Search').toBeTrue('Editor has no placeholder "Search"');
                done();
            });

            actionForOpen(view);
        });

        it('should has placeholder if model value == null, showSearch = false', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity,
                showSearch: false
            });

            show(view);

            view.on('dropdown:open', () => {
                expect(getInput(view)[0].getAttribute('placeholder') === '-').toBeTrue('Editor has no placeholder "-"');
                done();
            });

            actionForOpen(view);
        });

        it('should setReadonly when setReadonly is called', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            view.on('attach', () => {
                expect(view.readonly).toBeFalse();
                expect(view.dropdownView.button.readonly).toBeFalse();
                expect(
                    view
                        .dropdownView.button
                        .$el.find('input')
                        .attr('readonly')
                ).toBeUndefined();
                view.setReadonly(true);
                expect(view.readonly).toBeTrue();
                expect(view.dropdownView.button.readonly).toBeTrue();
                expect(
                    view
                        .dropdownView.button
                        .$el.find('input')
                        .attr('readonly')
                ).toEqual('readonly');
                view.setReadonly(false);
                expect(view.readonly).toBeFalse();
                expect(view.dropdownView.button.readonly).toBeFalse();
                expect(
                    view
                        .dropdownView.button
                        .$el.find('input')
                        .attr('readonly')
                ).toBeUndefined();
                done();
            });

            show(view);
        });

        it('should change value on setValue() get called', () => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            show(view);

            view.setValue([{ id: 2, name: 2 }]);

            expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
        });

        it('should change value on panel item click', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            view.listenToOnce(view, 'dropdown:open', () => {
                expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
                getItemOfList(1).click();
            });

            view.on('change', () => {
                expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
                done();
            });

            show(view);
            actionForOpen(view);
        });

        it('should trigger change and open panel on remove icon item click', done => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }, { id: 2, name: 2 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new DemoReferenceCollection(arrayObjects15),
                fetchFiltered: true,
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            show(view);

            view.on('change', () => {
                view.on('dropdown:open', () => {
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
                    done();
                });
            });

            view.$('.bubbles__i:eq(0)').trigger('mouseenter');

            view.$('.js-bubble-delete').click();
        });

        it('should remove items on remove icon item click', () => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }, { id: 2, name: 2 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            show(view);

            view.$('.bubbles__i:eq(1)').trigger('mouseenter');

            view.$('.js-bubble-delete')[0].click();
            expect(view.getValue()).toEqual([{ id: 1, name: 1 }]);

            view.$('.bubbles__i:eq(0)').trigger('mouseenter');

            view.$('.js-bubble-delete')[0].click();
            expect(view.getValue()).toEqual([]);
        });

        /*
        it('should set size for panel', () => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }, { id: 2, name: 2 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            show(view);

            view.$('.js-button-region').outerWidth(70);
            view.$('.bubbles').click();
            let panel = document.getElementsByClassName('dropdown__wrp')[0];
            expect(panel.clientHeight).toEqual(200);
        });
        */
        it('should remove items on uncheck in panel', done => {
            const model = new Backbone.Model({
                value: [{ id: 0, name: 'Test Reference 0' }, { id: 1, name: 'Test Reference 1' }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                key: 'value',
                maxQuantitySelected: Infinity,
                collection: arrayObjects15,
                autocommit: true
            });

            view.on('change', () => {
                expect(view.getValue()).toBeArrayOfSize(1);
                done();
            });

            view.on('attach', () => {
                view.on('dropdown:open', () => {
                    expect(view.dropdownView.isOpen).toBeTrue('Panel should be open!');
                    getItemOfList(0).click();
                });

                actionForOpen(view);
            });

            show(view);
        });
    
        it('should uncheck items on remove items click', done => {
            const model = new Backbone.Model({
                value: [{ id: 0, text: 'Text 0' }, { id: 1, text: 'Text 1' }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: arrayObjects15,
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            view.on('attach', () => {
                actionForOpen(view);
            });

            view.on('dropdown:open', () => {
                view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                view.$('.js-bubble-delete').click();
            });

            view.on('change', () => {
                expect(!!view.panelCollection.at(0).selected).toEqual(false);
                done();
            });

            show(view);
        });

        it('should show checkboxes and have correct style if showCheckboxes parameter set to true', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                showCheckboxes: true
            });

            view.on('attach', () => {
                actionForOpen(view);
            });

            view.on('dropdown:open', () => {
                const dropdownEl = document.body.getElementsByClassName('js-core-ui__global-popup-region')[0];

                expect(dropdownEl.getElementsByClassName('dd-list__i').length).toEqual(3);
                expect(dropdownEl.getElementsByClassName('js-checkbox').length).toEqual(3);
                done();
            });

            show(view);
        });

        it('should has selected items length as model values length', done => {
            const model = new Backbone.Model({
                value: 3
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                allowEmptyValue: false,
                autocommit: false,
                valueType: 'id'
            });

            let counter = 0;

            view.checkChange = () => counter++;

            view.on('attach', () => {
                actionForOpen(view);
            });

            view.on('dropdown:open', () => {
                const first = setInterval(() => {
                    if (view.panelCollection.length) {
                        clearTimeout(first);
                        setTimeout(() => {
                            expect(view.dropdownView.button.collectionView.collection.length).toEqual(1);
                            done();
                        }, 100);
                    }
                }, 20);
            });

            show(view);
        });

        it('should not triggerChange on blur', done => {
            const model = new Backbone.Model({
                value: 3
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                allowEmptyValue: false,
                autocommit: false,
                valueType: 'id'
            });

            let counter = 0;

            view.checkChange = () => counter++;

            view.on('attach', () => {
                actionForOpen(view);
            });

            view.on('dropdown:open', () => {
                const first = setInterval(() => {
                    if (view.panelCollection.length) {
                        clearTimeout(first);
                        setTimeout(() => {
                            view.blur();
                        }, 100);
                    }
                }, 20);
            });

            view.on('blur', () => {
                expect(counter).toEqual(0);
                done();
            });

            show(view);
        });

        describe('search and fetch', () => {
            it('should has input for search in single value mode', done => {
                const model = new Backbone.Model({
                    value: 54
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: false,
                    autocommit: true,
                    valueType: 'id'
                });
    
                view.on('attach', () => {
                    const input = getInput(view);
                    expect(input.length).toEqual(1);
                    done();
                });
    
                show(view);
            });
    
            it('should has input for search with readonly if options.showSearch = false in single value mode', done => {
                const model = new Backbone.Model({
                    value: 54
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: false,
                    showSearch: false,
                    autocommit: true,
                    valueType: 'id'
                });
    
                view.on('attach', () => {
                    const input = getInput(view);
                    expect(input[0].hasAttribute('readonly')).toBeTrue('input has no readonly attribute');
                    done();
                });
    
                show(view);
            });
    
            it('should has input for search in multi value mode', done => {
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        },
                        {
                            id: 'task.2',
                            text: 'Test Reference 2'
                        },
                        {
                            id: 'task.3',
                            text: 'Test Reference 3'
                        }
                    ]
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 3,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });
    
                view.on('attach', () => {
                    const input = getInput(view);
                    expect(input.length).toEqual(1);
                    done();
                });
    
                show(view);
            });
    
            it('should has input with readonly attr in multi value mode if options.showSearch = false', done => {
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        },
                        {
                            id: 'task.2',
                            text: 'Test Reference 2'
                        },
                        {
                            id: 'task.3',
                            text: 'Test Reference 3'
                        }
                    ]
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    showSearch: false,
                    maxQuantitySelected: 3,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });
    
                view.on('attach', () => {
                    const input = getInput(view);
                    expect(input[0].hasAttribute('readonly')).toBeTrue('input has no readonly attribute');
                    done();
                });
    
                show(view);
            });

            it('should not fetchUpdate after select item if search was empty', () => {
                const model = new Backbone.Model({
                    dropdownValue: ['1', '3', '5']
                });

                const collection = new DemoReferenceCollection(arrayObjects15);
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    key: 'dropdownValue',
                    autocommit: true,
                    collection: arrayObjects15,
                    maxQuantitySelected: Infinity,
                    valueType: 'id',
                    allowEmptyValue: true,
                    fetchFiltered: true,
                    collection
                });
    
                view.once('attach', () => {
                    view.once('view:ready', () => {
                        collection.on('sync', () => expect(false).toBeTrue('fetchUpdate is fired!'));
                        const nonSelectedItem = getItemOfList(8);
                        nonSelectedItem.click();
                    });
                    actionForOpen(view);
                });

                model.on('change:dropdownValue', (model, dropdownValue) => {
                    expect(dropdownValue).toBeArrayOfSize(4);
                    expect(dropdownValue.some(value => value.includes('8'))).toBeTrue();
                });
    
                show(view);
            });

                //ToDo add the same test for fetchFiltered = true
            it('should set value of first founded of search on Enter keyup for fetchFiltered = false', done => {
                const model = new Backbone.Model({
                    value: 3
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: collectionData3,
                    key: 'value',
                    autocommit: true,
                    fetchFiltered: false,
                    valueType: 'id'
                });
    
                view.once('attach', () => {
                    actionForOpen(view);
                });
    
                view.once('dropdown:open', () => {
                    startSearch(view.$el.find('input'), '2');
                });
    
                view.panelCollection.on('filter', () => {
                    if (view.panelCollection.length !== 1) {
                        return;
                    }
                    expect(view.panelCollection.length).toEqual(1);

                    // need wait __tryPointFirstRow
                    _.defer(() => Backbone.$('input').trigger({ type: 'keydown', keyCode: keyCode.ENTER}));
                });

                model.on('change:value', (model, value) => {
                    expect(value).toEqual(2);
                    done();
                });
    
                show(view);
            });
    
            it('should not set value on Enter keyup if search result is empty', done => {
                const model = new Backbone.Model({
                    value: 3
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: false,
                    autocommit: true,
                    valueType: 'id'
                });
    
                view.on('attach', () => {
                    const input = getInput(view);
                    startSearch(input, 'd');
                    const first = setInterval(() => {
                        if (view.panelCollection.length === 0) {
                            clearTimeout(first);
                            input.trigger({ type: 'keyup', bubbles: true, keyCode: keyCode.ENTER });
                            expect(model.get('value')).toEqual(3);
                            done();
                        }
                    }, 10);
                });
    
                show(view);
            });

            it('should fetch data on every focus if not readonly', done => {
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        },
                        {
                            id: 'task.2',
                            text: 'Test Reference 2'
                        }
                    ]
                });

                let fetchCounter = 0;
                const collection = new DemoReferenceCollection(arrayObjects15);
                collection.on('sync', () => fetchCounter++);
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 5,
                    fetchFiltered: true,
                    collection
                });
    
                const anotherView = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 5,
                    readonly: true,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });
    
                let counter = 0;
    
                view.on('view:ready', () => {
                    counter++;
                    expect(fetchCounter).toEqual(counter);
                    expect(view.isReady).toEqual(true);
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
                    if (counter < 3) {
                        _.delay(() => getInput(anotherView).click(), 20);
                    } else {
                        done();
                    }
                });
    
                anotherView.on('view:ready', () => expect(false).toBeTrue('readonly view is fetched!'));
                anotherView.$el.on('click', () => {
                    _.delay(() => getInput(view).click(), 701);
                });
    
                view.on('attach', () => {
                    expect(fetchCounter).toEqual(0);
                    actionForOpen(view);
                    expect(!!view.isReady).toEqual(false);
                    expect(!!view.dropdownView.isOpen).toEqual(false);
                });
    
                show(
                    new Core.layout.HorizontalLayout({
                        columns: [view, anotherView]
                    })
                );
            });

            it('should search on "input" event on input (for instance, paste data from right mouse button)', done => {
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        },
                        {
                            id: 'task.2',
                            text: 'Test Reference 2'
                        }
                    ]
                });
    
                let fetchCounter = 0;
                const collection = new DemoReferenceCollection(arrayObjects15);
                collection.on('sync', () => {
                    fetchCounter++
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 5,
                    fetchFiltered: true,
                    collection
                });
    
                view.on('attach', () => {
                    expect(fetchCounter).toEqual(0);
                    view.once('view:ready', () => {
                        view.once('view:ready', () => {
                            expect(fetchCounter).toEqual(1);
                            collection.off('sync');
                            done();
                        });

                        fetchCounter = 0;

                        const input = getInput(view);
                        input.val('3');
                        input.trigger('input');
                    });

                    actionForOpen(view);
                });
    
                show(view);
            });
        });

        describe('dropdown panel', () => {
            it('should not open panel after set value and then blur', () => {
                //Todo test
                expect(true).toEqual(true);
            });

            it('should open panel on input get focus', done => {
                const model = new Backbone.Model({
                    view: [1]
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    key: 'view',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 5,
                    valueType: 'id',
                    collection: arrayObjects15
                });
    
                view.on('attach', () => {
                    const input = getInput(view);
                    input.focus();
                });
    
                view.on('dropdown:open', () => {
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is not open!');
                    done();
                });
    
                show(view);
            });

            it('should close panel and clean on panel item click if maxQuantitySelected === 1', done => {
                const model = new Backbone.Model({
                    value: null
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    autocommit: true,
                    key: 'value',
                    maxQuantitySelected: 1
                });
    
                show(view);
    
                const input = getInput(view);
    
                view.on('dropdown:close', () => {
                    expect(view.getValue()).toEqual({ id: 2, name: 2 });
                    expect(view.dropdownView.isOpen).toBeFalse();
                    done();
                });
    
                view.on('dropdown:open', () => {
                    if (getTextElOfInputList(0).text() !== '2') {
                        return;
                    }
                    getItemOfList(0).click();
                });
    
                startSearch(input, '2');
            });
            
            //This test will check in the next one, but debug him is evil. 

            // it('should not close panel and clean on panel item click if maxQuantitySelected not exceeded', done => {
            //     const model = new Backbone.Model({
            //         value: null
            //     });
    
            //     const view = new core.form.editors.DatalistEditor({
            //         model,
            //         collection: arrayObjects15,
            //         autocommit: true,
            //         key: 'value',
            //         valueType: 'id',
            //         maxQuantitySelected: Infinity
            //     });
    
            //     show(view);
    
            //     const input = getInput(view);
            //     const onDropdownClose = jasmine.createSpy('Panel is closed!');
    
            //     view.on('view:ready', () => {
            //         if (!getTextElOfInputList(0).text().includes('2')) {
            //             return;
            //         }
    
            //         view.listenToOnce(view, 'dropdown:close', onDropdownClose);
            //         view.off('view:ready');
            //         getItemOfList(0).click();
            //     });
    
            //     model.on('change:value', (model, value) => {
            //         expect(value).toBeArrayOfSize(1);
            //         expect(value[0] === 2).toBeTrue('first value of array is not 2');
            //         // expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
            //         // view.off('dropdown:close');
            //         // done();
                    
            //         setTimeout(() => {
            //             expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
            //             view.stopListening();
            //             expect(onDropdownClose).not.toHaveBeenCalled();
            //         }, 0);
            //         // setTimeout(done, 10);
            //     });
    
            //     startSearch(input, '2');
            // });
            
            it('should close panel and clean on panel item click if maxQuantitySelected is exceeded', done => {
                const model = new Backbone.Model({
                    value: null
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    maxQuantitySelected: 2
                });

                let isCloseTriggered = false;
                let counter = 0;

                view.on('dropdown:open', () => {
                    view.on('dropdown:close', () => {
                        isCloseTriggered = true;
                        expect(view.dropdownView.isOpen).toBeFalse();
                        // expect(getItemOfList(0).length).toEqual(0);
                    });
                    getItemOfList(0).click();
                    setTimeout(() => getItemOfList(1).click());
                });

                view.on('change', () => {
                    counter++;
                    if (counter < 2) {
                        return;
                    }
                    setTimeout(() => {
                        expect(isCloseTriggered).toBeTrue('view has no trigger close');
                        expect(view.getValue()).toEqual([{ id: 1, name: 1 }, { id: 2, name: 2 }]);
                        done();
                    });
                });
    
                show(view);
    
                const input = getInput(view);
                startSearch(input, '');
            });

            it('should open panel on render if options.openOnRender = true', () => {
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        },
                        {
                            id: 'task.2',
                            text: 'Test Reference 2'
                        },
                        {
                            id: 'task.3',
                            text: 'Test Reference 3'
                        }
                    ]
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    openOnRender: true,
                    maxQuantitySelected: 3,
                    collection: arrayObjects15
                });
    
                view.on('dropdown:open', () => {
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
                });
    
                show(view);
            });
    
            it('should not open panel on render if options.openOnRender = undefined', done => {
                const model = new Backbone.Model({
                    DatalistValue: ['task.1', 'task.2', 'task.3']
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    valueType: 'id',
                    maxQuantitySelected: 3,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });
    
                view.on('attach', () => {
                    expect(view.dropdownView.isOpen).toBeFalsy('Panel open on attach!');
                    done();
                });
    
                show(view);
            });
    
            it('should not open panel on render if options.openOnRender = false', done => {
                const model = new Backbone.Model({
                    DatalistValue: ['task.1', 'task.2', 'task.3']
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showCheckboxes: true,
                    openOnRender: false,
                    valueType: 'id',
                    maxQuantitySelected: 3,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });
    
                view.on('attach', () => {
                    expect(!!view.dropdownView.isOpen).toEqual(false);
                    done();
                });
    
                show(view);
            });
    
            it('should not open panel if after focus on blur', done => {
                //this test is correct if controller has delay
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        },
                        {
                            id: 'task.2',
                            text: 'Test Reference 2'
                        }
                    ]
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 5,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });
    
                view.on('view:ready', () => {
                    expect(view.isReady).toEqual(true);
                    expect(!!view.dropdownView.isOpen).toEqual(false);
                    done();
                });
    
                view.on('attach', () => {
                    actionForOpen(view);
                    expect(!!view.isReady).toEqual(false);
                    expect(!!view.dropdownView.isOpen).toEqual(false);
                    view.blur();
                });
    
                show(view);
            });

            it('should open panel on actionForOpen if view is ready', done => {
                //this test is correct if controller has delay
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        },
                        {
                            id: 'task.2',
                            text: 'Test Reference 2'
                        }
                    ]
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 5,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });
    
                view.on('view:ready', () => {
                    expect(view.isReady).toEqual(true);
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
                    done();
                });
    
                view.on('attach', () => {
                    actionForOpen(view);
                    expect(!!view.isReady).toEqual(false);
                    expect(!!view.dropdownView.isOpen).toEqual(false);
                });
    
                show(view);
            });
        });

        describe('after reset passed collection', () => {
            it('(mode: id, quan: many): -not open panel, -select all value items, -try adjust values', done => {
                const someCollection = new Backbone.Collection();
    
                const model = new Backbone.Model({
                    dropdownValue: [1, 3, 5]
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    key: 'dropdownValue',
                    autocommit: true,
                    collection: someCollection,
                    valueType: 'id',
                    maxQuantitySelected: 4,
                    allowEmptyValue: true
                });
    
                view.once('attach', () => {
                    setTimeout(() => {
                        expect(view.value).toBeArrayOfSize(3);
                        view.$('.bubbles__i > span').each((i, el) => {
                            expect(el.innerText.startsWith('#')).toBeTrue();
                        });
                        view.on('view:ready', () => expect(false).toBeTrue());
    
                        someCollection.reset(arrayObjects15);
                        expect(view.panelCollection.length).toEqual(arrayObjects15.length);
                        expect(view.dropdownView.isOpen).toBeFalsy();
                        expect(Object.keys(view.panelCollection.selected)).toBeArrayOfSize(3);
    
                        expect(view.value).toBeArrayOfSize(3);
                        view.$('.bubbles__i > span').each((i, el) => {
                            expect(el.innerText.startsWith('#')).toBeFalse();
                        });
    
                        done();
                    }, 100);
                });
    
                show(view);
            });
    
            it('(mode: id, quan: one): -not open panel, -select all value items, -try adjust values', done => {
                const someCollection = new Backbone.Collection();
    
                const model = new Backbone.Model({
                    dropdownValue: 1
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    key: 'dropdownValue',
                    autocommit: true,
                    collection: someCollection,
                    valueType: 'id',
                    maxQuantitySelected: 1,
                    allowEmptyValue: true
                });
    
                view.once('attach', () => {
                    setTimeout(() => {
                        expect(view.value).toBeNumber();
                        view.$('.bubbles__i > span').each((i, el) => {
                            expect(el.innerText.startsWith('#')).toBeTrue();
                        });
                        view.on('view:ready', () => expect(false).toBeTrue());
    
                        someCollection.reset(arrayObjects15);
    
                        expect(view.panelCollection.length).toEqual(arrayObjects15.length);
                        expect(view.dropdownView.isOpen).toBeFalsy();
    
                        //if quan === 1 panelCollection not select this.value to prevent dblclick for close.
                        expect(Object.keys(view.panelCollection.selected)).toBeArrayOfSize(0);
    
                        expect(view.value).toBeNumber();
                        view.$('.bubbles__i > span').each((i, el) => {
                            expect(el.innerText.startsWith('#')).toBeFalse();
                        });
    
                        done();
                    }, 100);
                });
    
                show(view);
            });
    
            it('(mode: normal, quan: many): -not open panel, -select all value items', done => {
                const someCollection = new Backbone.Collection();
                const model = new Backbone.Model({
                    dropdownValue: [
                        {
                            id: '1',
                            text: 'Text 1',
                            subtext: 'subtext 1'
                        },
                        {
                            id: '3',
                            text: 'Text 3',
                            subtext: 'subtext 3'
                        },
                        {
                            id: '5',
                            text: 'Text 5',
                            subtext: 'subtext 5'
                        }
                    ]
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    key: 'dropdownValue',
                    autocommit: true,
                    collection: someCollection,
                    maxQuantitySelected: 4,
                    allowEmptyValue: true
                });
    
                view.once('attach', () => {
                    expect(view.value).toBeArrayOfSize(3);
                    view.on('view:ready', () => expect(false).toBeTrue());
    
                    someCollection.reset(arrayObjects15);

                    // on reset virtualCollection rebuild Index, after then datalist __updateSelectedOnPanel.

                    expect(view.panelCollection.length).toEqual(arrayObjects15.length);
                    expect(view.dropdownView.isOpen).toBeFalsy();
                    expect(Object.keys(view.panelCollection.selected)).toBeArrayOfSize(3);
                    expect(view.value).toBeArrayOfSize(3);
    
                    done();
                });
    
                show(view);
            });
    
            it('(mode: normal, quan: one): -not open panel, -select all value items', done => {
                const someCollection = new Backbone.Collection();
                const model = new Backbone.Model({
                    dropdownValue:
                    {
                        id: '1',
                        text: 'Text 1',
                        subtext: 'subtext 1'
                    }
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    key: 'dropdownValue',
                    autocommit: true,
                    collection: someCollection,
                    maxQuantitySelected: 1,
                    allowEmptyValue: true
                });
    
                view.once('attach', () => {
                    expect(view.value).toBeObject();
                    view.on('view:ready', () => expect(false).toBeTrue());
    
                    someCollection.reset(arrayObjects15);
    
                    expect(view.panelCollection.length).toEqual(arrayObjects15.length);
                    expect(view.dropdownView.isOpen).toBeFalsy();
    
                    //if quan === 1 panelCollection not select this.value to prevent dblclick for close.
                    expect(Object.keys(view.panelCollection.selected)).toBeArrayOfSize(0);
    
                    expect(view.value).toBeObject();
    
                    done();
                });
    
                show(view);
            });
        });

        describe('should has view.value as', () => {
            it('primitive if maxQuantitySelected: 1, valueType: id', done => {
                const model = new Backbone.Model({
                    value: 1
                });

                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: true,
                    autocommit: true,
                    valueType: 'id',
                    maxQuantitySelected: 1
                });

                view.on('attach', () => {
                    expect(view.value).toBeNumber();

                    view.on('dropdown:open', () => {
                        model.on('change', () => {
                            expect(view.value).toBeNumber();
                            expect(model.get('value')).toBeNumber();
                            done();
                        });
                        getItemOfList(0).click();
                    });

                    view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                    view.$('.js-bubble-delete').click();
                });

                show(view);
            });

            it('array with primitives if maxQuantitySelected > 1, valueType: id', () => {
                const model = new Backbone.Model({
                    value: [1, 2, 3]
                });

                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: false,
                    autocommit: true,
                    valueType: 'id',
                    maxQuantitySelected: 3
                });

                view.on('attach', () => {
                    expect(view.value).toBeArrayOfNumbers();
                    expect(view.value).toBeArrayOfSize(3);
                                        
                    view.on('dropdown:open', () => {
                        model.on('change', () => {
                            expect(view.value).toBeArrayOfNumbers();
                            expect(view.value).toBeArrayOfSize(3);
                            expect(model.get('value')).toBeArrayOfNumbers();
                            expect(model.get('value')).toBeArrayOfSize(3);
                        });
                        getItemOfList(0).click();
                    });

                    view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                    view.$('.js-bubble-delete').click();
                });

                show(view);
            });

            it('array of objects if maxQuantitySelected > 1, valueType: normal', done => {
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        },
                        {
                            id: 'task.2',
                            text: 'Test Reference 2'
                        },
                        {
                            id: 'task.3',
                            text: 'Test Reference 3'
                        }
                    ]
                });

                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 3,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });

                view.on('attach', () => {
                    expect(view.value).toBeArrayOfObjects();
                    expect(view.value).toBeArrayOfSize(3);
                    
                    view.on('view:ready', () => {
                        model.on('change', () => {
                            expect(view.value).toBeArrayOfObjects();
                            expect(view.value).toBeArrayOfSize(3);
                            expect(model.get('DatalistValue')).toBeArrayOfObjects();
                            expect(model.get('DatalistValue')).toBeArrayOfSize(3);
                            done();
                        });
                        getItemOfList(0).click();
                    });

                    view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                    view.$('.js-bubble-delete').click();
                });

                show(view);
            });

            it('object if maxQuantitySelected = 1, valueType: normal', done => {
                const model = new Backbone.Model({
                    DatalistValue:
                    {
                        id: 'task.1',
                        text: 'Test Reference 1'
                    }
                });

                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 1,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });

                view.on('attach', () => {
                    expect(view.value).toBeObject();

                    view.on('view:ready', () => {
                        model.on('change', () => {
                            expect(view.value).toBeObject();
                            expect(model.get('DatalistValue')).toBeObject();
                            done();
                        });
                        getItemOfList(0).click();
                    });

                    view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                    view.$('.js-bubble-delete').click();
                });

                show(view);
            });
        });

        describe('should on remove last bubble set to model', () => {
            it('null if maxQuantitySelected: 1, valueType: id', done => {
                const model = new Backbone.Model({
                    value: 1
                });

                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: true,
                    autocommit: true,
                    valueType: 'id',
                    maxQuantitySelected: 1
                });

                model.on('change:value', (model, value) => {
                    expect(value).toBeNull(`onClear set "${whatIsThat(value)}" to model!`);
                });

                view.on('dropdown:open', () => {
                    expect(getInput(view)).toBeFocused('Input not focused after remove element');
                    done();
                });

                view.on('attach', () => {
                    view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                    view.$('.js-bubble-delete').click();
                });

                show(view);
            });

            it('empty array if maxQuantitySelected > 1, valueType: id', done => {
                const model = new Backbone.Model({
                    value: [1]
                });

                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: true,
                    autocommit: true,
                    valueType: 'id',
                    maxQuantitySelected: 3
                });

                model.on('change:value', (model, value) => {
                    expect(value).toBeEmptyArray(`onClear set "${whatIsThat(value)}" to model!`);
                });

                view.on('dropdown:open', () => {
                    expect(getInput(view)).toBeFocused('Input not focused after remove element');
                    done();
                });

                view.on('attach', () => {
                    view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                    view.$('.js-bubble-delete').click();
                });

                show(view);
            });

            it('empty array if maxQuantitySelected > 1, valueType: normal', done => {
                const model = new Backbone.Model({
                    DatalistValue: [
                        {
                            id: 'task.1',
                            text: 'Test Reference 1'
                        }
                    ]
                });

                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    allowEmptyValue: true,
                    maxQuantitySelected: 3,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });

                model.on('change:DatalistValue', (model, value) => {
                    expect(value).toBeEmptyArray(`onClear set "${whatIsThat(value)}" to model!`);
                });

                view.on('view:ready', () => {
                    expect(getInput(view)).toBeFocused('Input not focused after remove element');
                    done();
                });

                view.on('attach', () => {
                    view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                    view.$('.js-bubble-delete').click();
                });

                show(view);
            });

            it('null if maxQuantitySelected = 1, valueType: normal', done => {
                const model = new Backbone.Model({
                    DatalistValue:
                    {
                        id: 'task.1',
                        text: 'Test Reference 1'
                    }
                });

                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    allowEmptyValue: true,
                    maxQuantitySelected: 1,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });

                model.on('change:DatalistValue', (model, value) => {
                    expect(value).toBeNull(`onClear set "${whatIsThat(value)}" to model!`);
                });

                view.on('view:ready', () => {
                    expect(getInput(view)).toBeFocused('Input not focused after remove element');
                    done();
                });

                view.on('attach', () => {
                    view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                    view.$('.js-bubble-delete').click();
                });

                show(view);
            });
        });

        describe('should set correct value to model on click item of dropdown', () => {
            it('maxQuantitySelected: 1, valueType: id', done => {
                const model = new Backbone.Model({
                    value: undefined
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: collectionData3,
                    key: 'value',
                    allowEmptyValue: false,
                    autocommit: true,
                    valueType: 'id',
                    maxQuantitySelected: 1
                });
    
                view.on('attach', () => {
                    actionForOpen(view);
                });

                view.on('dropdown:open', () => {
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
                    getItemOfList(0).click();
                });

                model.on('change:value', (model, value) => {
                    expect(value).toBeNumber();
                    done();
                });
    
                show(view);
            });

            it('maxQuantitySelected > 1, valueType: id', done => {
                const model = new Backbone.Model({
                    value: undefined
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: false,
                    autocommit: true,
                    valueType: 'id',
                    maxQuantitySelected: 3
                });

                view.on('attach', () => {
                    actionForOpen(view);
                });

                view.on('dropdown:open', () => {
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
                    getItemOfList(0).click();
                });

                model.on('change:value', (model, value) => {
                    expect(value).toBeArrayOfNumbers();
                    expect(value).toBeArrayOfSize(1);
                    done();
                });
    
                show(view);
            });

            it('maxQuantitySelected > 1, valueType: normal', done => {
                const model = new Backbone.Model({
                    value: undefined
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'value',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 3,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });

                view.on('attach', () => {
                    actionForOpen(view);
                });

                view.on('view:ready', () => {
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
                    getItemOfList(0).click();
                });

                model.on('change:value', (model, value) => {
                    expect(value).toBeArrayOfObjects();
                    expect(value).toBeArrayOfSize(1);
                    done();
                });

                show(view);
            });

            it('maxQuantitySelected = 1, valueType: normal', done => {
                const model = new Backbone.Model({
                    value: undefined
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'value',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 1,
                    fetchFiltered: true,
                    collection: new DemoReferenceCollection(arrayObjects15)
                });

                view.on('attach', () => {
                    actionForOpen(view);
                });

                view.on('view:ready', () => {
                    expect(view.dropdownView.isOpen).toBeTrue('Panel is closed!');
                    getItemOfList(0).click();
                });

                model.on('change:value', (model, value) => {
                    expect(value).toBeObject();
                    done();
                });
    
                show(view);
            });
        });
    });
});
