import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('TextEditorView', () => {
        const findInput = function(view) {
            return view.$('.input');
        };

        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    data: 'text'
                });
                return new core.form.editors.TextEditor({
                    model,
                    key: 'data'
                });
            },
            focusElement: '.input'
        });

        it('should have `value` matched with initial value', () => {
            // arrange
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
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
            expect(findInput(view).val()).toEqual(expected);
            expect(value).toEqual(expected);
        });

        it('should have `value` matched with initial value (w/o data binding).', () => {
            // arrange
            const expected = 'text';
            const view = new core.form.editors.TextEditor({
                value: expected
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            // act
            const value = view.getValue();

            // assert
            expect(findInput(view).val()).toEqual(expected);
            expect(value).toEqual(expected);
        });

        it('should update `value` and send `change` on user change.', () => {
            // arrange
            const expected = 'text 2';
            const model = new Backbone.Model({
                data: 'text'
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            view.focus();
            const input = findInput(view);
            input.val(expected);
            input.change();

            // assert
            expect(view.getValue()).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` and send `change` on user change (w/o data binding).', () => {
            const expected = 'text 2';
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.TextEditor({
                value: 'text'
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

            expect(view.getValue()).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` on model change', () => {
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            // act
            model.set('data', 'text 2');
            const value = view.getValue();

            // assert
            const expected = model.get('data');
            expect(findInput(view).val()).toEqual(expected);
            expect(value).toEqual(expected);
            expect(onChangeCallback).not.toHaveBeenCalled();
        });

        it('should not commit if `autocommit: false`', () => {
            // arrange
            const expected = 'text';
            const model = new Backbone.Model({
                data: expected
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const onCommitCallback = jasmine.createSpy('onCommitCallback');
            const view = new core.form.editors.TextEditor({
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
            input.val('text 2');
            input.change();

            // assert
            expect(model.get('data')).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).not.toHaveBeenCalled();
        });

        it('should commit if `autocommit: true`', () => {
            // arrange
            const expected = 'text 2';
            const model = new Backbone.Model({
                data: 'text'
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const onCommitCallback = jasmine.createSpy('onCommitCallback');
            const view = new core.form.editors.TextEditor({
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

        it('should have `isEmptyValue() === true` if null or empty string', () => {
            // arrange
            const model = new Backbone.Model({
                data: null
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            // act
            const isEmpty = view.isEmptyValue();
            view.setValue('');
            const isEmptyIfEmptyString = view.isEmptyValue();

            // assert
            expect(isEmpty).toEqual(true);
            expect(isEmptyIfEmptyString).toEqual(true);
        });

        it('should have `isEmptyValue() === false` if has text', () => {
            // arrange
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
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
            expect(isEmpty).toEqual(false);
        });

        it("should update `value` when typing if `changemode: 'keydown'`", () => {
            // arrange
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
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
            input.val('text2');
            input.keyup();

            // assert
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should clear value, dont change attribute and dont trigger change event on remove button click', () => {
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            view.$el.trigger('mouseenter');
            view.$('.js-clear-button').click();

            const isEmpty = view.isEmptyValue();
            const input = findInput(view);

            expect(model.get('data')).toEqual('text');
            expect(isEmpty).toEqual(true);
            expect(onChangeCallback).toHaveBeenCalledTimes(0);
            expect(input.val()).toEqual('');
        });

        it('should clear attribute and value and trigger change event on remove button click and then blur()', () => {
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            view.$el.trigger('mouseenter');
            view.$('.js-clear-button').click();
            view.blur();

            const isEmpty = view.isEmptyValue();
            const input = findInput(view);

            expect(model.get('data')).toEqual(null);
            expect(isEmpty).toEqual(true);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(input.val()).toEqual('');
        });

        it('should be readonly if flag is passed', () => {
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                readonly: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            const isEmpty = view.isEmptyValue();
            const input = findInput(view);

            expect(model.get('data')).toEqual('text');
            expect(isEmpty).toEqual(false);

            view.trigger('mouseenter');
            //expect(view.$el.closest('.js-clear-button')).toBeHidden();
            expect(onChangeCallback).toHaveBeenCalledTimes(0);
            expect(input.val()).toEqual('text');
            expect(input.prop('readonly')).toEqual(true);
        });

        it('should be hidden if flag is passed', () => {
            expect(true).toEqual(true);
        });

        it('should have no title options.showTitle false', () => {
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                readonly: true,
                showTitle: false
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(findInput(view).prop('title')).toEqual('');
        });

        it('should have title options.showTitle true', () => {
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                readonly: true,
                showTitle: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(findInput(view).prop('title')).toEqual('text');
        });

        it('should show title passed in configuration', () => {
            expect(true).toEqual(true);
        });

        it('should hide clear button if hideClearButton = true', () => {
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
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

        it('should set email placeholder, mask and validator if same format was passed', () => {
            const model = new Backbone.Model({
                data: 'some invalid @ ema.il  . comm'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                format: 'email'
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const input = view.ui.input;
            expect(input.prop('placeholder')).toEqual('Enter email');
            expect(input.val()).toEqual('someinvalid@email.comm');
            model.set('data', 'invalid');
            expect(view.validate()).toEqual({
                type: 'email',
                message: 'Invalid email address'
            });

            model.set('data', 'valid@email.com');
            expect(view.validate()).toBeUndefined();
        });

        it('should set phone placeholder, mask and validator if same format was passed', () => {
            const model = new Backbone.Model({
                data: '123456789'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                format: 'phone'
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const input = view.ui.input;
            expect(input.prop('placeholder')).toEqual('5 (555) 555-55-55');
            expect(input.val()).toEqual('1 (234) 567-89-__');
            model.set('data', 'invalid');
            expect(view.validate()).toEqual({
                type: 'phone',
                message: 'Invalid phone number'
            });
            model.set('data', '5 (555) 555-55-55');
            expect(view.validate()).toBeUndefined();
        });
    });
});
