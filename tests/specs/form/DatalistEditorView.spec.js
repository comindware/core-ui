import core from 'coreApi';
import 'jasmine-jquery';
import 'jasmine-expect';
import { keyCode } from 'utils';
import FocusTests from './FocusTests';

const controllerDelay = 700;

describe('Editors', () => {
    const getElement = (view, selector) => view.$(selector);
    const getButton = view => view.dropdownView.button.$el;
    const getBubble = (view, index) => getElement(view, `.bubbles__i:eq(${index})`);
    const getBubbleDelete = view => getElement(view, '.js-bubble-delete');
    const getItemOfList = index => getElement(Backbone, `.dd-list__i:eq(${index})`);
    const getTextElOfInputList = () => getElement(Backbone, `.js-input.bubbles__input`);

    const getInput = view => getElement(view, '.js-input');

    const startSearch = (input, string) => {
        input.click();
        input.focus();
        input.val(string);
        input.keydown();
    };

    const actionForOpen = view =>
        getInput(view)
            .click()
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

    const possibleItems15 = _.times(15, n => ({
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

    const dynamicController = core.form.editors.reference.controllers.BaseReferenceEditorController.extend({
        async fetch() {
            return new Promise(resolve => {
                this.collection.reset(collectionData3);

                this.totalCount = 3;
                return sleep(resolve, {
                    collection: collectionData3,
                    totalCount: this.totalCount
                });
            });
        }
    });

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

        it('should show empty model placeholder on empty value', () => {
            //Todo test
            expect(true).toEqual(true);
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

        it('should not open panel after set value and then blur', () => {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should have `value` matched with initial value', () => {
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

        it('view collection should have reset on dropdown open', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                }),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            let counter = 0;

            view.panelCollection.parentCollection.on('reset', () => {
                counter++;
            });

            view.on('view:ready', () => {
                expect(counter).toEqual(1);
                done();
            });

            show(view);
            actionForOpen(view);
        });

        it('should have collection matched it static initial collection', done => {
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

            actionForOpen(view);
            view.on('view:ready', () => {
                expect(view.panelCollection.toJSON()).toEqual(collectionData3);
                done();
            });
        });

        it('should have collection matched it dynamic initial collection', done => {
            const model = new Backbone.Model({
                value: null
            });

            const collection = new core.form.editors.reference.collections.BaseReferenceCollection(collectionData3);

            const view = new core.form.editors.DatalistEditor({
                model,
                controller: new dynamicController({
                    collection
                }),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            view.on('attach', () => {
                actionForOpen(view);
                view.on('view:ready', () => {
                    expect(view.panelCollection.length).toEqual(collectionData3.length);
                    done();
                });
            });

            show(view);
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
                expect(view.dropdownView.button.searchInputView.readonly).toBeFalse();
                expect(view.dropdownView.button.searchInputView.$el.find('input').attr('readonly')).toBeUndefined();
                view.setReadonly(true);
                expect(view.readonly).toBeTrue();
                expect(view.dropdownView.button.searchInputView.readonly).toBeTrue();
                expect(view.dropdownView.button.searchInputView.$el.find('input').attr('readonly')).toEqual('readonly');
                view.setReadonly(false);
                expect(view.readonly).toBeFalse();
                expect(view.dropdownView.button.searchInputView.readonly).toBeFalse();
                expect(view.dropdownView.button.searchInputView.$el.find('input').attr('readonly')).toBeUndefined();
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

        it('should open panel when click (and focus) input', done => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            view.on('view:ready', () => {
                expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
                done();
            });

            show(view);

            actionForOpen(view);
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

            view.listenToOnce(view, 'view:ready', () => {
                expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
                getItemOfList(1).click();
                expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
                done();
            });

            show(view);
            actionForOpen(view);
        });

        it('should close panel and clean on panel item click if maxQuantitySelected === 1', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: 1
            });

            show(view);

            const input = getInput(view);

            view.on('dropdown:close', () => {
                expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
                expect(view.dropdownView.isOpen).toBeFalse();
                // expect(getItemOfList(0).length).toEqual(0);
                done();
            });

            view.on('view:ready', () => {
                if (getTextElOfInputList(0).text() !== '2') {
                    return;
                }
                getItemOfList(0).click();
            });

            startSearch(input, '2');
        });

        it('should close panel and clean on panel item click if maxQuantitySelected not exceeded', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value',
                maxQuantitySelected: 5
            });

            show(view);

            const input = getInput(view);
            startSearch(input, '2');

            view.on('view:ready', () => {
                if (getTextElOfInputList(0).text() !== '2') {
                    return;
                }
                getTextElOfInputList(0).click();
                expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
                expect(view.dropdownView.isOpen).toBeTrue();
                // expect(getItemOfList(0).length).toEqual(1);
                done();
            });
        });

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

            show(view);

            const input = getInput(view);
            startSearch(input, '');

            view.on('view:ready', () => {
                view.on('dropdown:close', () => {
                    expect(view.getValue()).toEqual([{ id: 1, name: 1 }, { id: 2, name: 2 }]);
                    expect(view.dropdownView.isOpen).toBeFalse();
                    // expect(getItemOfList(0).length).toEqual(0);
                    done();
                });
                getItemOfList(0).click();
                getItemOfList(1).click();
            });
        });

        it('should trigger change and open panel on remove icon item click', done => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }, { id: 2, name: 2 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                }),
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            show(view);

            view.on('change', () => {
                view.on('dropdown:open', () => {
                    expect(view.dropdownView.isOpen).toEqual(true);
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
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                })
            });

            view.on('view:ready', () => {
                expect(view.isReady).toEqual(true);
                expect(view.dropdownView.isOpen).toEqual(true);
                done();
            });

            view.on('attach', () => {
                actionForOpen(view);
                expect(!!view.isReady).toEqual(false);
                expect(!!view.dropdownView.isOpen).toEqual(false);
            });

            show(view);
        });

        it('should fetch data on every click', done => {
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

            async function sleep(fn, ...args) {
                await timeout(100);
                return fn(...args);
            }

            const AnotherDynamicController = core.form.editors.reference.controllers.BaseReferenceEditorController.extend({
                fetchCounter: 0,

                async fetch() {
                    this.fetchCounter++;
                    return new Promise(resolve => {
                        this.collection.reset(collectionData3);

                        this.totalCount = 3;
                        return sleep(resolve, {
                            collection: collectionData3,
                            totalCount: this.totalCount
                        });
                    });
                }
            });

            const anotherDynamicController = new AnotherDynamicController({
                collection: new core.form.editors.reference.collections.BaseReferenceCollection()
            });

            const view = new core.form.editors.DatalistEditor({
                model: model,
                key: 'DatalistValue',
                autocommit: true,
                showEditButton: true,
                showAddNewButton: true,
                showCheckboxes: true,
                maxQuantitySelected: 5,
                controller: anotherDynamicController
            });

            const anotherView = new core.form.editors.DatalistEditor({
                model: model,
                key: 'DatalistValue',
                autocommit: true,
                showEditButton: true,
                showAddNewButton: true,
                showCheckboxes: true,
                maxQuantitySelected: 5,
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                })
            });

            let counter = 0;

            view.on('view:ready', () => {
                counter++;
                expect(view.controller.fetchCounter).toEqual(counter);
                expect(view.isReady).toEqual(true);
                expect(view.dropdownView.isOpen).toEqual(true);
                if (counter < 3) {
                    _.delay(() => actionForOpen(anotherView), 20);
                } else {
                    done();
                }
            });

            anotherView.on('view:ready', () => {
                _.delay(() => actionForOpen(view), 20);
            });

            view.on('attach', () => {
                expect(view.controller.fetchCounter).toEqual(0);
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
        
        it('should remove items on uncheck in panel', done => {
            const model = new Backbone.Model({
                value: [{ id: 'task.1', name: 'Test Reference 1' }, { id: 'task.2', name: 'Test Reference 2' }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                controller: new core.form.editors.reference.controllers.DemoReferenceEditorController(),
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true,
                openOnRender: true
            });

            view.on('change', () => {
                expect(view.getValue()).toEqual([{ id: 'task.2', name: 'Test Reference 2' }]);
                done();
            });

            view.on('view:ready', () => {
                const tId = setTimeout(() => {
                    if (Backbone.$('.dd-list__i:eq(0)').el) {
                        console.log(Backbone.$('.dd-list__i:eq(0)').el);
                        Backbone.$('.dd-list__i:eq(0)').click();
                        clearTimeout(tId);
                    }
                }, 300);
            });

            show(view);

            view.focus();
        });
        */
        it('should uncheck items on remove items click', done => {
            const model = new Backbone.Model({
                value: [{ id: 'task.1', name: 'Test Reference 1' }, { id: 'task.2', name: 'Test Reference 2' }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                }),
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

        it('should use default parameters if non is passed', () => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData3),
                key: 'value'
            });

            show(view);

            expect(view.options).toEqual(
                jasmine.objectContaining({
                    displayAttribute: 'name',
                    controller: null,
                    showAddNewButton: false,
                    showEditButton: false,
                    showCheckboxes: false,
                    textFilterDelay: 300,
                    maxQuantitySelected: 1,
                    canDeleteItem: true
                })
            );
        });
        /*
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

            const appView = window.app.getView();

            appView.getRegion('contentRegion').show(view);

            view.focus();

            const dropdownEl = document.body.getElementsByClassName('js-core-ui__global-popup-region')[0];

            view.on('view:ready', () => {
                expect(dropdownEl.getElementsByClassName('dd-list__i').length).toEqual(3);
                expect(dropdownEl.getElementsByClassName('js-checkbox').length).toEqual(3);
                done();
            });
        });
        */

        it('should set value of first founded of search on Enter keyup', done => {
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

            view.once('attach', () => {
                actionForOpen(view);
            });

            view.once('view:ready', () => {
                startSearch(view.$el.find('input'), '2');
            });

            view.on('view:ready', () => {
                if (view.panelCollection.length !== 1) {
                    return;
                }
                expect(view.panelCollection.length).toEqual(1);
                view.$el.find('input').trigger({ type: 'keyup', bubbles: true, keyCode: keyCode.ENTER });
                expect(model.get('value')).toEqual(2);
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

            view.on('view:ready', () => {
                const first = setInterval(() => {
                    if (view.panelCollection.length) {
                        clearTimeout(first);
                        setTimeout(() => {
                            expect(view.dropdownView.button.collection.length).toEqual(1);
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

            view.on('view:ready', () => {
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

        it('should has no input for search in single value mode if options.showSearch = false', done => {
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
                expect(input.length).toEqual(0);
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
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                })
            });

            view.on('attach', () => {
                const input = getInput(view);
                expect(input.length).toEqual(1);
                done();
            });

            show(view);
        });

        it('should has no input for search in multi value mode if options.showSearch = false', done => {
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
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                })
            });

            view.on('attach', () => {
                const input = getInput(view);
                expect(input.length).toEqual(0);
                done();
            });

            show(view);
        });

        it('should open panel on render if options.openOnRender = true', done => {
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
                openOnRender: true,
                maxQuantitySelected: 3,
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                })
            });

            view.on('view:ready', () => {
                expect(view.dropdownView.isOpen).toEqual(true);
                done();
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
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                })
            });

            view.on('view:ready', () => {
                expect(!!view.dropdownView.isOpen).toEqual(false);
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
                showEditButton: true,
                showAddNewButton: true,
                showCheckboxes: true,
                openOnRender: false,
                valueType: 'id',
                maxQuantitySelected: 3,
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                })
            });

            view.on('view:ready', () => {
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
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                })
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

        //ToDo: repeat next test for another 3 modes.
        it('after reset passed collection(mode: id, quan: many): -not open panel, -select all value items, -try adjust values', done => {
            const someCollection = new Backbone.Collection();

            const model = new Backbone.Model({
                dropdownValue: ['1', '3', '5']
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

            view.once('view:ready', () => {
                expect(view.value).toBeArrayOfSize(3);
                view.value.forEach(val => {
                    expect(view.__getDisplayText(val.attributes).startsWith('#')).toBeTrue();
                });
                view.on('view:ready', () => expect(false).toBeTrue());

                someCollection.reset(possibleItems15);
                expect(view.panelCollection.length).toEqual(possibleItems15.length);
                expect(view.dropdownView.isOpen).toBeFalsy();
                expect(Object.keys(view.panelCollection.selected)).toBeArrayOfSize(3);

                expect(view.value).toBeArrayOfSize(3);
                view.value.forEach(val => {
                    expect(view.__getDisplayText(val.attributes).startsWith('#')).toBeFalse();
                });

                done();
            });

            show(view);
        });

        it('after reset passed collection(mode: id, quan: one): -not open panel, -select all value items, -try adjust values', done => {
            const someCollection = new Backbone.Collection();

            const model = new Backbone.Model({
                dropdownValue: '1'
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

            view.once('view:ready', () => {
                expect(view.value).toBeArrayOfSize(1);
                view.value.forEach(val => {
                    expect(view.__getDisplayText(val.attributes).startsWith('#')).toBeTrue();
                });
                view.on('view:ready', () => expect(false).toBeTrue());

                someCollection.reset(possibleItems15);
                expect(view.panelCollection.length).toEqual(possibleItems15.length);
                expect(view.dropdownView.isOpen).toBeFalsy();
                expect(Object.keys(view.panelCollection.selected)).toBeArrayOfSize(1);

                expect(view.value).toBeArrayOfSize(1);
                view.value.forEach(val => {
                    expect(view.__getDisplayText(val.attributes).startsWith('#')).toBeFalse();
                });

                done();
            });

            show(view);
        });

        it('after reset passed collection(mode: normal, quan: many): -not open panel, -select all value items', done => {
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

                someCollection.reset(possibleItems15);

                expect(view.panelCollection.length).toEqual(possibleItems15.length);
                expect(view.dropdownView.isOpen).toBeFalsy();
                expect(Object.keys(view.panelCollection.selected)).toBeArrayOfSize(3);
                expect(view.value).toBeArrayOfSize(3);

                done();
            });

            show(view);
        });

        it('after reset passed collection(mode: normal, quan: one): -not open panel, -select all value items', done => {
            const someCollection = new Backbone.Collection();
            const model = new Backbone.Model({
                dropdownValue: [
                    {
                        id: '1',
                        text: 'Text 1',
                        subtext: 'subtext 1'
                    }
                ]
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
                expect(view.value).toBeArrayOfSize(1);
                view.on('view:ready', () => expect(false).toBeTrue());

                someCollection.reset(possibleItems15);

                expect(view.panelCollection.length).toEqual(possibleItems15.length);
                expect(view.dropdownView.isOpen).toBeFalsy();
                expect(Object.keys(view.panelCollection.selected)).toBeArrayOfSize(1);
                expect(view.value).toBeArrayOfSize(1);

                done();
            });

            show(view);
        });

        describe('should always has view.value type is Array with Object', () => {
            it('maxQuantitySelected: 1, valueType: id', done => {
                const model = new Backbone.Model({
                    value: 1
                });

                const view = new core.form.editors.DatalistEditor({
                    model,
                    collection: new Backbone.Collection(collectionData3),
                    key: 'value',
                    allowEmptyValue: false,
                    autocommit: true,
                    valueType: 'id',
                    maxQuantitySelected: 1
                });

                view.on('view:ready', () => {
                    expect(view.value).toBeArrayOfObjects();
                    expect(view.value).toBeArrayOfSize(1);
                    done();
                });

                show(view);
            });

            it('maxQuantitySelected > 1, valueType: id', done => {
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

                view.on('view:ready', () => {
                    expect(view.value).toBeArrayOfObjects();
                    expect(view.value).toBeArrayOfSize(3);
                    done();
                });

                show(view);
            });

            it('maxQuantitySelected > 1, valueType: normal', done => {
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
                    controller: new dynamicController({
                        collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                    })
                });

                view.on('attach', () => {
                    expect(view.value).toBeArrayOfObjects();
                    expect(view.value).toBeArrayOfSize(3);
                    done();
                });

                show(view);
            });

            it('maxQuantitySelected = 1, valueType: normal', done => {
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
                    maxQuantitySelected: 3,
                    controller: new dynamicController({
                        collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                    })
                });

                view.on('attach', () => {
                    expect(view.value).toBeArrayOfObjects();
                    expect(view.value).toBeArrayOfSize(1);
                    done();
                });

                show(view);
            });
        });

        /*
        describe('should set correct value to model on select', () => {
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
                    getButton(view).click();
                    view.on('view:ready', () => {
                        expect(view.dropdownView.isOpen).toEqual(true);
                        getItemOfList(0).click();
                        expect(model.get('value')).toBeNumber();
                        done();
                    });
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
                    getButton(view).click();
                    view.on('view:ready', () => {
                        expect(view.dropdownView.isOpen).toEqual(true);
                        getItemOfList(0).click();
                        getItemOfList(1).click();
                        expect(model.get('value')).toBeArrayOfNumbers();
                        expect(model.get('value')).toBeArrayOfSize(2);
                        done();
                    });
                });
    
                show(view);
            });

            it('maxQuantitySelected > 1, valueType: normal', done => {
                const model = new Backbone.Model({
                    DatalistValue: undefined
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 3,
                    controller: new dynamicController({
                        collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                    })
                });
    
                view.on('attach', () => {
                    getButton(view).click();
                    view.on('view:ready', () => {
                        expect(view.dropdownView.isOpen).toEqual(true);
                        getItemOfList(0).click();
                        getItemOfList(1).click();
                        expect(model.get('value')).toBeArrayOfObjects();
                        expect(model.get('value')).toBeArrayOfSize(2);
                        done();
                    });
                });

                show(view);
            });

            it('maxQuantitySelected = 1, valueType: normal', done => {
                const model = new Backbone.Model({
                    DatalistValue: undefined
                });
    
                const view = new core.form.editors.DatalistEditor({
                    model: model,
                    key: 'DatalistValue',
                    autocommit: true,
                    showEditButton: true,
                    showAddNewButton: true,
                    showCheckboxes: true,
                    maxQuantitySelected: 3,
                    controller: new dynamicController({
                        collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                    })
                });
    
                view.on('attach', () => {
                    getButton(view).click();
                    view.on('view:ready', () => {
                        expect(view.dropdownView.isOpen).toEqual(true);
                        getItemOfList(0).click();
                        expect(model.get('value')).toBeArrayOfObjects();
                        expect(model.get('value')).toBeArrayOfSize(1);
                        done();
                    });
                });
    
                show(view);
            });
        });
        */
    });
});
