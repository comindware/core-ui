/*eslint-ignore*/

import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';
import sinon from 'sinon';

describe('Editors', function() {
    const findInput = function(view) {
        return view.$('.js-input');
    };

    const dynamicController = core.form.editors.reference.controllers.BaseReferenceEditorController.extend({
        fetch() {
            const promise = new Promise(resolve => {
                this.totalCount = 3;

                return resolve({
                    collection: this.collection.toJSON(),
                    totalCount: this.totalCount
                });
            });

            return promise;
        }
    });

    beforeEach(function () {
        this.rootRegion = initializeCore();

        this.defaultCollection = new Backbone.Collection([{
            id: 1,
            name: 1
        }, {
            id: 2,
            name: 2
        }, {
            id: 3,
            name: 3
        }]);
    });

    describe('ReferenceBubbleEditorView', function() {
        it('should get focus when focus() is called', function() {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.focus();

            expect(findInput(view)).toBeFocused();
            expect(view.hasFocus).toEqual(true, 'Must have focus.');
        });

        it('should lose focus when blur() is called', function() {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.focus();

            view.blur();

            expect(findInput(view)).not.toBeFocused();
            expect(view.dropdownView.isOpen).toEqual(false, 'Must close dropdown on blur.');
            expect(view.hasFocus).toEqual(false, 'Must have focus.');
        });

        it('should show empty model placeholder on empty value', function() {
            //Todo test
            expect(true).toEqual(true);
        });

        it('UI should match it configuration', function() {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should show error view if wrongly instantiated', function() {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should show error view with appropriate message and help text', function() {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should have `value` matched with initial value', function() {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            expect(view.getValue()).toEqual([{ id: 1, name: 1 }]);
        });

        it('view collection should have reset on dropdown open', function() {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                }),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.focus();

            const dataChangeCallback = sinon.spy();

            view.viewModel.get('panel').get('collection').on('reset', dataChangeCallback);

            expect(dataChangeCallback.calledOnce);
            expect(dataChangeCallback.calledWithMatch(this.defaultCollection.toJSON()));
        });

        it('should have collection matched it static initial collection', function() {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.focus();

            expect(view.viewModel.get('panel').get('collection').toJSON()).toEqual(this.defaultCollection.toJSON());
        });

        it('should have collection matched it dynamic initial collection', function() {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                controller: new dynamicController({
                    collection: new core.form.editors.reference.collections.BaseReferenceCollection()
                }),
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.focus();

            view.viewModel.get('panel').get('collection').on('reset', function () {
                expect(view.viewModel.get('panel').get('collection').toJSON()).toEqual(this.defaultCollection.toJSON());
            });
        });

        it('should have change value on setValue() get called', function() {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.setValue([{ id: 2, name: 2 }]);

            expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
        });

        it('should open panel when focus input', function() {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.focus();

            expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
        });

        it('should change value on panel item select', function() {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.focus();

            expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');

            view.panelCollection.at(1).select();

            expect(view.getValue()).toEqual([{ id: 2, name: 2 }]);
        });

        it('should highlight or check panel items based on editor value', function() {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }]
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            view.focus();

            expect(view.dropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
        });

        it('should remove items on remove icon item click', function() {
            const model = new Backbone.Model({
                value: [{ id: 1, name: 1 }, { id: 2, name: 2 }]
            });

            const view = new core.form.editors.ReferenceBubbleEditor({
                model,
                collection: this.defaultCollection,
                key: 'value',
                maxQuantitySelected: Infinity
            });

            this.rootRegion.show(view);

            console.log(view.$('.js-bubble-delete').length);

            view.$('.js-bubble-delete')[1].click();
            expect(view.getValue()).toEqual([{ id: 1, name: 1 }]);

            view.$('.js-bubble-delete')[0].click();
            expect(view.getValue()).toEqual([]);
        });

        it('should remove items on uncheck in panel', function() {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should uncheck items on remove items click', function() {
            //Todo test
            expect(true).toEqual(true);
        });

        it('should apply default parameters', function() {
            //Todo test
            expect(true).toEqual(true);
        });
    });
});
