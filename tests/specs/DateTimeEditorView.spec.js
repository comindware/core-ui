/**
 * Developer: Stepan Burguchev
 * Date: 6/14/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import core from 'coreApi';
import { initializeCore } from '../utils/helpers';
import 'jasmine-jquery';

describe('Editors', function () {
    beforeEach(function () {
        this.rootRegion = initializeCore();
    });

    describe('DateTimeEditorView', function () {
        let findDateInput = function (view) {
            return view.$('.js-date-input');
        };

        let findTimeInput = function (view) {
            return view.$('.js-time-input');
        };

        let findDateDropdownPanel = function (view) {
            return view.$('.js-date-region .js-popout-region .dropdown');
        };

        let selectTodayOnOpenPanel = function (view) {
            view.$('.today:visible').click();
        };

        it('should get focus when focus() is called', function () {
            // arrange
            let model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data'
            });
            this.rootRegion.show(view);

            // act
            view.focus();

            // assert
            expect(findDateInput(view)).toBeFocused();
            expect(view.dateView.calendarDropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
            expect(view.hasFocus).toEqual(true, 'Must have focus.');
        });

        it('should lose focus when blur() is called', function () {
            // arrange
            let model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data'
            });
            this.rootRegion.show(view);
            view.focus();

            // act
            view.blur();

            // assert
            expect(findDateInput(view)).toBeFocused(); // Closing dropdown doesn't clear activeDocument to keep dropdown nesting
            expect(view.dateView.calendarDropdownView.isOpen).toEqual(false, 'Dropdown mustn\'t be open.');
            expect(view.hasFocus).toEqual(false, 'Mustn\'t have focus.');
        });

        it('should have `value` matched with initial value', function () {
            // arrange
            let model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data'
            });
            this.rootRegion.show(view);

            // act
            let value = view.getValue();

            // assert
            let expected = model.get('data');
            expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(value).toEqual(expected);
        });

        it('should have `value` matched with initial value (w/o data binding).', function () {
            // arrange
            let expected = '2015-07-20T10:46:37.000Z';
            let view = new core.form.editors.DateTimeEditor({
                value: expected
            });
            this.rootRegion.show(view);

            // act
            let value = view.getValue();

            // assert
            expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(value).toEqual(expected);
        });

        it('should update `value` and send `change` on user change.', function () {
            // arrange
            let model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            let onChangeCallback = jasmine.createSpy('onChangeCallback');
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data'
            });
            this.rootRegion.show(view);
            view.on('change', onChangeCallback);

            // act
            view.focus();
            selectTodayOnOpenPanel(view);

            // assert
            expect(view.getValue()).not.toEqual(model.get('data'));
            expect(core.lib.moment(view.getValue()).year()).toEqual(core.lib.moment().year());
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` and send `change` on user change (w/o data binding).', function () {
            // arrange
            let onChangeCallback = jasmine.createSpy('onChangeCallback');
            let expected = '2015-07-20T10:46:37.000Z';
            let view = new core.form.editors.DateTimeEditor({
                value: expected
            });
            this.rootRegion.show(view);
            view.on('change', onChangeCallback);

            // act
            view.focus();
            selectTodayOnOpenPanel(view);

            // assert
            expect(view.getValue()).not.toEqual(expected);
            expect(core.lib.moment(view.getValue()).year()).toEqual(core.lib.moment().year());
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` on model change', function () {
            // arrange
            let onChangeCallback = jasmine.createSpy('onChangeCallback');
            let model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data'
            });
            this.rootRegion.show(view);
            view.on('change', onChangeCallback);

            // act
            model.set('data', '2016-01-01T00:00:06.000Z');
            let value = view.getValue();

            // assert
            let expected = model.get('data');
            expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(value).toEqual(expected);
            expect(onChangeCallback).not.toHaveBeenCalled();
        });

        it('should not commit if `autocommit: false`', function () {
            // arrange
            let expected = '2015-07-20T10:46:37.000Z';
            let model = new Backbone.Model({
                data: expected
            });
            let onChangeCallback = jasmine.createSpy('onChangeCallback');
            let onCommitCallback = jasmine.createSpy('onCommitCallback');
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data'
            });
            this.rootRegion.show(view);
            view.on('change', onChangeCallback);
            view.on('value:committed', onCommitCallback);

            // act
            view.focus();
            selectTodayOnOpenPanel(view);

            // assert
            expect(model.get('data')).toEqual(expected);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).not.toHaveBeenCalled();
        });

        it('should commit if `autocommit: true`', function () {
            // arrange
            let expected = '2016-01-01T00:00:06.000Z';
            let model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            let onChangeCallback = jasmine.createSpy('onChangeCallback');
            let onCommitCallback = jasmine.createSpy('onCommitCallback');
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data',
                autocommit: true
            });
            this.rootRegion.show(view);
            view.on('change', onChangeCallback);
            view.on('value:committed', onCommitCallback);

            // act
            view.focus();
            selectTodayOnOpenPanel(view);

            // assert
            expect(view.getValue()).toEqual(model.get('data'));
            expect(core.lib.moment(view.getValue()).year()).toEqual(core.lib.moment().year());
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).toHaveBeenCalledTimes(1);
        });

        it('should have `isEmptyValue() === true` if null', function () {
            // arrange
            let model = new Backbone.Model({
                data: null
            });
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data'
            });
            this.rootRegion.show(view);

            // act
            let isEmpty = view.isEmptyValue();

            // assert
            expect(isEmpty).toEqual(true);
        });

        it('should have `isEmptyValue() === false` if has value', function () {
            // arrange
            let model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            let view = new core.form.editors.DateTimeEditor({
                model: model,
                key: 'data'
            });
            this.rootRegion.show(view);

            // act
            let isEmpty = view.isEmptyValue();

            // assert
            expect(isEmpty).toEqual(false);
        });
    });
});
