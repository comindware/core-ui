import core from 'coreApi';
import 'jasmine-jquery';
import { keyCode } from 'utils';

describe('Editors', () => {
    const getElement = (view, selector) => view.$(selector);
    const getButton = view => view.dropdownView.button.$el;
    const getBubble = (view, index) => getElement(view, `.bubbles__i:eq(${index})`);
    const getBubbleDelete = view => getElement(view, '.js-bubble-delete');

    const findInput = view => getElement(view, '.js-input');

    const collectionData = [
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

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function sleep(fn, ...args) {
        await timeout(1000);
        return fn(...args);
    }

    const dynamicController = core.form.editors.reference.controllers.BaseReferenceEditorController.extend({
        async fetch() {
            return new Promise(resolve => {
                this.collection.reset(collectionData);

                this.totalCount = 3;
                return sleep(resolve, {
                    collection: collectionData,
                    totalCount: this.totalCount
                });
            });
        }
    });

    afterEach(() => {
        core.services.WindowService.closePopup();
    });

    describe('DatalistEditorView', () => {
        it('should get focus when focus() is called', done => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.focus();
            view.on('view:ready', () => {
                expect(findInput(view)).toBeFocused();
                expect(view.hasFocus).toEqual(true, 'Must have focus.');
                done();
            });
        });

        it('should lose focus when blur() is called', done => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.focus();

            view.on('view:ready', () => {
                view.blur();
                expect(findInput(view)).not.toBeFocused();
                expect(view.hasFocus).toEqual(false, 'Must have focus.');
                done();
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

        it('should have `value` matched with initial value', () => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(view.getValue()).toEqual([{ id: 1, name: 1 }]);
        });

        it('view collection should have reset on dropdown open', () => {
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

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const doneFn = jasmine.createSpy();
            view.panelCollection.on('reset', () => doneFn);

            view.focus();
            expect(doneFn.calledOnce);
        });

        it('should have collection matched it static initial collection', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.focus();
            view.on('view:ready', () => {
                expect(view.viewModel.panel.get('collection').toJSON()).toEqual(collectionData);
                done();
            });
        });

        it('should have collection matched it dynamic initial collection', done => {
            const model = new Backbone.Model({
                value: null
            });

            const collection = new core.form.editors.reference.collections.BaseReferenceCollection(collectionData);

            const view = new core.form.editors.DatalistEditor({
                model,
                controller: new dynamicController({
                    collection
                }),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            view.on('attach', () => {
                view.focus();
                view.on('view:ready', () => {
                    expect(view.panelCollection.length).toEqual(collectionData.length);
                    done();
                });
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should change value on setValue() get called', () => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.setValue([{ id: 2, name: 2 }]);

            expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
        });

        it('should open panel when focus input', done => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            
                view.on('view:ready', () => {
                    expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
                    done();
                });

            view.focus();
        });

        it('should change value on panel item select', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.focus();

            view.on('view:ready', () => {
                expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
                view.panelCollection.at(1).select();
                expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
                done();
            });
        });

        it('should trigger change on remove icon item click', done => {
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

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.on('change', () => {
                expect(true).toEqual(true);
                done();
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
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.$('.bubbles__i:eq(1)').trigger('mouseenter');

            view.$('.js-bubble-delete')[0].click();
            expect(view.getValue()).toEqual([{ id: 1, name: 1 }]);

            view.$('.bubbles__i:eq(0)').trigger('mouseenter');

            view.$('.js-bubble-delete')[0].click();
            expect(view.getValue()).toEqual([]);
        });

        it('should open panel on click if view is ready', done => {
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
                const button = getButton(view);
                button.click();
                expect(!!view.isReady).toEqual(false);
                expect(!!view.dropdownView.isOpen).toEqual(false);
            });

            window.app
            .getView()
            .getRegion('contentRegion')
            .show(view);
        });
        /*
        it('should set size for panel', () => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }, { id: 2, name: 2 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

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

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

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
                view.focus();
            });

            view.on('dropdown:open', () => {
                view.$('.bubbles__i:eq(0)').trigger('mouseenter');
                view.$('.js-bubble-delete').click();
            });

            view.on('change', () => {
                expect(!!view.panelCollection.at(0).selected).toEqual(false);
                done();
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should use default parameters if non is passed', () => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value'
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(view.options).toEqual(
                jasmine.objectContaining({
                    displayAttribute: 'name',
                    controller: null,
                    showAddNewButton: false,
                    showEditButton: false,
                    showCheckboxes: false,
                    textFilterDelay: 500,
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
                collection: new Backbone.Collection(collectionData),
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
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                allowEmptyValue: false,
                autocommit: true,
                valueType: 'id',
            });

            view.on('attach', () => {
                const input = findInput(view);
                input.click();
                input.val('1');
                input.keydown();
                const first = setInterval(() => {
                    if (view.panelCollection.length === 1) {
                        clearTimeout(first);
                        input.trigger({type: 'keyup', bubbles: true, keyCode: keyCode.ENTER});
                        expect(model.get('value')).toEqual(1);
                        done();
                    }
                }, 10);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });
        /*
        it('should not set value on Enter keyup if search result is empty', done => {
            const model = new Backbone.Model({
                value: 3
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                allowEmptyValue: false,
                autocommit: true,
                valueType: 'id',
            });

            view.on('attach', () => {
                const input = findInput(view);
                const first = setInterval(() => {
                    input.click();
                    input.val('d');
                    input.keydown();
                    if (view.panelCollection.length === 0) {
                        clearTimeout(first);
                        input.trigger({type: 'keyup', bubbles: true, keyCode: keyCode.ENTER});
                        expect(model.get('value')).toEqual(3);
                        done();
                    }
                }, 10);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });
        */
        it('should not delete selected value on blur if search result is none', done => {
            const model = new Backbone.Model({
                value: 3
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                allowEmptyValue: false,
                autocommit: true,
                valueType: 'id'
            });

            view.on('attach', () => {
                const length = view.dropdownView.button.collectionView.collection.length;
                expect(length).toEqual(2); //selected + input

                const input = findInput(view);   
                    input.click();
                    input.val('d');
                    input.keydown();
                const first = setInterval(() => {
                    if (view.panelCollection.length === 0) {
                        clearTimeout(first);
                        setTimeout(() => {
                            view.blur();
                            const length = view.dropdownView.button.collectionView.collection.length;
                            expect(length).toEqual(2); //selected + input
                            done();
                        }, 100);
                    }
                }, 10);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should have input for search in single value mode', done => {
            const model = new Backbone.Model({
                value: 54
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                collection: new Backbone.Collection(collectionData),
                key: 'value',
                allowEmptyValue: false,
                autocommit: true,
                valueType: 'id',
            });

            view.on('attach', () => {
                const input = findInput(view);
                expect(input.length).toEqual(1);
                done();
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should have input for search in multi value mode', done => {
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
                const input = findInput(view);
                expect(input.length).toEqual(1);
                done();
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });
    });
});
