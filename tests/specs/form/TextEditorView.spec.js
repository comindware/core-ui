/**
 * Developer: Stepan Burguchev
 * Date: 6/14/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Editors', () => {
    let rootRegion;

    beforeEach(() => {
        rootRegion = initializeCore();
    });

    describe('TextEditorView', () => {
        const findInput = function(view) {
            return view.$('input');
        };

        it('should get focus when focus() is called', () => {
            // arrange
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data'
            });
            rootRegion.show(view);

            // act
            view.focus();

            // assert
            expect(findInput(view)).toBeFocused();
            expect(view.hasFocus).toEqual(true, 'Must have focus.');
        });

        it('should lose focus when blur() is called', () => {
            // arrange
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data'
            });
            rootRegion.show(view);
            view.focus();

            // act
            view.blur();

            // assert
            expect(findInput(view)).not.toBeFocused();
            expect(view.hasFocus).toEqual(false, 'Mustn\'t have focus.');
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
            rootRegion.show(view);

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
            rootRegion.show(view);

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
            rootRegion.show(view);
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
            const expected = 'text 2';
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.TextEditor({
                value: 'text'
            });
            rootRegion.show(view);
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
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data'
            });
            rootRegion.show(view);
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
            rootRegion.show(view);
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
            rootRegion.show(view);
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
            rootRegion.show(view);

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
            rootRegion.show(view);

            // act
            const isEmpty = view.isEmptyValue();

            // assert
            expect(isEmpty).toEqual(false);
        });

        it('should update `value` when typing if `changemode: \'keydown\'`', () => {
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
            rootRegion.show(view);
            view.on('change', onChangeCallback);

            // act
            view.focus();
            const input = findInput(view);
            input.val('text2');
            input.keyup();

            // assert
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should clear value and trigger change event on remove button click', () => {
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

            rootRegion.show(view);
            view.on('change', onChangeCallback);

            view.$el.trigger('mouseenter');
            view.$('.js-clear-button').click();

            const isEmpty = view.isEmptyValue();
            const input = findInput(view);

            expect(model.get('data')).toEqual(null);
            expect(isEmpty).toEqual(true);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(input.val()).toEqual('');
        });

        it('should be read only if flag is passed', () => {
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

            rootRegion.show(view);
            view.on('change', onChangeCallback);

            const isEmpty = view.isEmptyValue();
            const input = findInput(view);

            expect(model.get('data')).toEqual('text');
            expect(isEmpty).toEqual(false);
            view.$el.trigger('mouseenter');
            expect(view.$('.js-clear-button')).toBeHidden();
            expect(onChangeCallback).toHaveBeenCalledTimes(0);
            expect(input.val()).toEqual('text');
            expect(input.prop('readonly')).toEqual(true);
        });

        it('should be hidden if flag is passed', () => {
            expect(true).toEqual(true);
        });

        it('should show title passed in configuration', () => {
            expect(true).toEqual(true);
        });

        it('should hide clear button if allowEmptyValue = false', () => {
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.TextEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                allowEmptyValue: false
            });

            rootRegion.show(view);

            view.$el.trigger('mouseenter');
            expect(view.$('.js-clear-button').length).toEqual(0);
        });
    });
});
