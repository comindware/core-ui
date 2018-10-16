/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('BooleanEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    data: false
                });
                return new core.form.editors.BooleanEditor({
                    model,
                    key: 'data'
                });
            }
        });

        const findButton = function(view) {
            return view.$el;
        };

        it('should have `value` matched with initial value', () => {
            const model = new Backbone.Model({
                data: true
            });
            const view = new core.form.editors.BooleanEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const value = view.getValue();

            const expected = model.get('data');
            expect(view.$el).toHaveClass(core.form.editors.BooleanEditor.classes.CHECKED);
            expect(value).toEqual(expected);
        });

        it('should have `value` matched with initial value (w/o data binding).', () => {
            // arrange
            const expected = true;
            const view = new core.form.editors.BooleanEditor({
                value: expected
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const value = view.getValue();

            expect(view.$el).toHaveClass(core.form.editors.BooleanEditor.classes.CHECKED);
            expect(value).toEqual(expected);
        });

        it('should update `value` and send `change` on user change.', () => {
            const expected = true;
            const model = new Backbone.Model({
                data: false
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.BooleanEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            view.focus();
            findButton(view).click();

            expect(view.getValue()).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` and send `change` on user change (w/o data binding).', () => {
            const expected = true;
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.BooleanEditor({
                value: false
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            view.focus();
            findButton(view).click();

            expect(view.getValue()).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` on model change', () => {
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: false
            });
            const view = new core.form.editors.BooleanEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            model.set('data', true);
            const value = view.getValue();

            const expected = model.get('data');
            expect(view.$el).toHaveClass(core.form.editors.BooleanEditor.classes.CHECKED);
            expect(value).toEqual(expected);
            expect(onChangeCallback).not.toHaveBeenCalled();
        });

        it('should not commit if `autocommit: false`', () => {
            const expected = false;
            const model = new Backbone.Model({
                data: expected
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const onCommitCallback = jasmine.createSpy('onCommitCallback');
            const view = new core.form.editors.BooleanEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);
            view.on('value:committed', onCommitCallback);

            view.focus();
            findButton(view).click();

            expect(model.get('data')).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).not.toHaveBeenCalled();
        });

        it('should commit if `autocommit: true`', () => {
            const expected = true;
            const model = new Backbone.Model({
                data: false
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const onCommitCallback = jasmine.createSpy('onCommitCallback');
            const view = new core.form.editors.BooleanEditor({
                model,
                key: 'data',
                autocommit: true
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);
            view.on('value:committed', onCommitCallback);

            view.focus();
            findButton(view).click();

            expect(model.get('data')).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).toHaveBeenCalledTimes(1);
        });

        it('should have `isEmptyValue() === true` if null', () => {
            const model = new Backbone.Model({
                data: null
            });
            const view = new core.form.editors.BooleanEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const isEmpty = view.isEmptyValue();

            expect(isEmpty).toEqual(true);
        });

        it('should have `isEmptyValue() === false` if has value including `false`', () => {
            const model = new Backbone.Model({
                data: true
            });
            const view = new core.form.editors.BooleanEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const isEmpty = view.isEmptyValue();
            view.setValue(false);
            const isEmptyIfFalse = view.isEmptyValue();

            expect(isEmpty).toEqual(false);
            expect(isEmptyIfFalse).toEqual(false);
        });
    });
});
