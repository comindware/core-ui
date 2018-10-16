/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('NumberEditorView', () => {
        const findInput = function(view) {
            return view.$('input');
        };

        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    data: 123
                });

                return new core.form.editors.NumberEditor({
                    model,
                    key: 'data'
                });
            },
            focusElement: 'input'
        });

        it('should have `value` matched with initial value', () => {
            // arrange
            const model = new Backbone.Model({
                data: 123
            });
            const view = new core.form.editors.NumberEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            // act
            const value = view.getValue();

            // assert
            const expected = model.get('data');
            expect(Number(findInput(view).val())).toEqual(expected);
            expect(value).toEqual(expected);
        });

        it('should have `value` matched with initial value (w/o data binding).', () => {
            // arrange
            const expected = 123;
            const view = new core.form.editors.NumberEditor({
                value: expected
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            // act
            const value = view.getValue();

            // assert
            expect(Number(findInput(view).val())).toEqual(expected);
            expect(value).toEqual(expected);
        });

        it('should update `value` and send `change` on user change.', () => {
            // arrange
            const expected = 321;
            const model = new Backbone.Model({
                data: 123
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.NumberEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            // act
            view.focus();
            const input = findInput(view);
            input.val(expected);
            input.change();
            // assert
            expect(view.getValue()).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` and send `change` on user change (w/o data binding).', () => {
            // arrange
            const expected = 321;
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.NumberEditor({
                value: 123
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            // act
            view.focus();
            const input = findInput(view);
            input.val(expected);
            input.change();

            // assert
            expect(view.getValue()).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` on model change', () => {
            // arrange
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: 123
            });
            const view = new core.form.editors.NumberEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            // act
            model.set('data', 321);
            const value = view.getValue();

            // assert
            const expected = model.get('data');
            expect(Number(findInput(view).val())).toEqual(expected);
            expect(value).toEqual(expected);
            expect(onChangeCallback).not.toHaveBeenCalled();
        });

        it('should not commit if `autocommit: false`', () => {
            // arrange
            const expected = 123;
            const model = new Backbone.Model({
                data: expected
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const onCommitCallback = jasmine.createSpy('onCommitCallback');
            const view = new core.form.editors.NumberEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);
            view.on('value:committed', onCommitCallback);

            // act
            view.focus();
            const input = findInput(view);
            input.val(321);
            input.change();

            // assert
            expect(model.get('data')).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).not.toHaveBeenCalled();
        });

        it('should commit if `autocommit: true`', () => {
            // arrange
            const expected = 321;
            const model = new Backbone.Model({
                data: 123
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const onCommitCallback = jasmine.createSpy('onCommitCallback');
            const view = new core.form.editors.NumberEditor({
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

            // act
            view.focus();
            const input = findInput(view);
            input.val(expected);
            input.change();

            // assert
            expect(model.get('data')).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).toHaveBeenCalledTimes(1);
        });

        it('should have `isEmptyValue() === true` if null', () => {
            // arrange
            const model = new Backbone.Model({
                data: null
            });
            const view = new core.form.editors.NumberEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            // act
            const isEmpty = view.isEmptyValue();

            // assert
            expect(isEmpty).toEqual(true);
        });

        it('should have `isEmptyValue() === false` if has value including 0', () => {
            // arrange
            const model = new Backbone.Model({
                data: 123
            });
            const view = new core.form.editors.NumberEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            // act
            const isEmpty = view.isEmptyValue();
            view.setValue(0);
            const isEmptyIfZero = view.isEmptyValue();

            // assert
            expect(isEmpty).toEqual(false);
            expect(isEmptyIfZero).toEqual(false);
        });

        it("should update `value` when typing if `changemode: 'keydown'`", () => {
            // arrange
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: 123
            });
            const view = new core.form.editors.NumberEditor({
                model,
                key: 'data',
                changeMode: 'keydown'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            // act
            view.focus();
            const input = findInput(view);
            input.val(312);
            input.trigger('keyup');

            // assert
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        
        it('should hide clear button if hideClearButton = true', () => {
            const model = new Backbone.Model({
                data: 123
            });
            const view = new core.form.editors.NumberEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                hideClearButton: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.trigger('mouseenter');
            expect(view.$('.js-clear-button').length).toEqual(0);
        });
    });
});
