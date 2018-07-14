import core from 'coreApi';
import 'jasmine-jquery';

const $ = core.lib.$;

describe('Editors', () => {
    const findInput = function(view) {
        return view.$('.js-input');
    };

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
                url: 'dynamic/mock',
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

        it('should have collection matched it dynamic initial collection', () => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                url: 'dynamic/mock',
                key: 'value',
                maxQuantitySelected: Infinity
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.panelCollection.on('reset', () => {
                expect(view.panelCollection.toJSON()).toEqual(collectionData);
            });
            view.focus();
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

            view.focus();
            view.on('view:ready', () => {
                expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
                done();
            });
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
                url: 'dynamic/mock',
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
                value: [{ id: 1, name: 1 }, { id: 2, name: 2 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                url: 'dynamic/mock',
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            view.on('change', () => {
                expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
                done();
            });

            view.on('view:ready', () => {
                $('.dd-list__i')[0].click();
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.focus();
        });
        
        it('should uncheck items on remove items click', done => {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }, { id: 2, name: 2 }]
            });

            const view = new core.form.editors.DatalistEditor({
                model,
                url: 'dynamic/mock',
                key: 'value',
                maxQuantitySelected: Infinity,
                autocommit: true
            });

            view.on('change', () => {
                console.log(1);
                expect(view.panelCollection.at(0).selected).toEqual(false);
                done();
            });

            view.on('view:ready', () => {
                view.$(view.$('.bubbles__i:eq(0)')[0]).trigger('mouseenter');
                view.$('.js-bubble-delete')[0].click();
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.focus();
        });
        */
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
    });
});
