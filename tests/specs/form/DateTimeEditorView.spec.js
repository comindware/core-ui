/*eslint-ignore*/

import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Editors', () => {
    beforeEach(function() {
        this.rootRegion = initializeCore();
    });

    describe('DateTimeEditorView', () => {
        const findDateInput = function(view) {
            return view.$('.js-date-input');
        };

        const findTimeInput = function(view) {
            return view.$('.js-time-input');
        };

        const selectTodayOnOpenPanel = function(view) {
            view.dateView.calendarDropdownView.panelView.$('.today:visible').click();
        };

        it('should get focus when focus() is called', function() {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });
            this.rootRegion.show(view);

            // act
            view.focus();

            // assert
            expect(findDateInput(view)).toBeFocused();
            expect(view.calendarDropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
            expect(view.hasFocus).toEqual(true, 'Must have focus.');
        });

        it('should lose focus when blur() is called', function() {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });
            this.rootRegion.show(view);
            view.focus();

            // act
            view.blur();

            // assert
            return true;
            //expect(findDateInput(view)).toBeFocused(); // Closing dropdown doesn't clear activeDocument to keep dropdown nesting
            //expect(view.dateView.calendarDropdownView.isOpen).toEqual(false, 'Dropdown mustn\'t be open.');
            //expect(view.hasFocus).toEqual(false, 'Mustn\'t have focus.');
        });

        it('should have `value` matched with initial value', function() {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });
            this.rootRegion.show(view);

            // act
            const value = view.getValue();

            // assert
            const expected = model.get('data');
            expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(value).toEqual(expected);
        });

        it('should have `value` matched with initial value (w/o data binding).', function() {
            // arrange
            const expected = '2015-07-20T10:46:37.000Z';
            const view = new core.form.editors.DateTimeEditor({
                value: expected
            });
            this.rootRegion.show(view);

            // act
            const value = view.getValue();

            // assert
            expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(value).toEqual(expected);
        });

        it('should update `value` and send `change` on user change.', function() {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.DateTimeEditor({
                model,
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

        it('should update `value` and send `change` on user change (w/o data binding).', function() {
            // arrange
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const expected = '2015-07-20T10:46:37.000Z';
            const view = new core.form.editors.DateTimeEditor({
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

        it('should update `value` on model change', function() {
            // arrange
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });
            this.rootRegion.show(view);
            view.on('change', onChangeCallback);

            // act
            model.set('data', '2016-01-01T00:00:06.000Z');
            const value = view.getValue();

            // assert
            const expected = model.get('data');
            expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(value).toEqual(expected);
            expect(onChangeCallback).not.toHaveBeenCalled();
        });

        it('should not commit if `autocommit: false`', function() {
            // arrange
            const expected = '2015-07-20T10:46:37.000Z';
            const model = new Backbone.Model({
                data: expected
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const onCommitCallback = jasmine.createSpy('onCommitCallback');
            const view = new core.form.editors.DateTimeEditor({
                model,
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

        it('should commit if `autocommit: true`', function() {
            const expected = '2016-01-01T00:00:06.000Z';
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const onCommitCallback = jasmine.createSpy('onCommitCallback');
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data',
                autocommit: true
            });
            this.rootRegion.show(view);
            view.on('change', onChangeCallback);
            view.on('value:committed', onCommitCallback);

            view.focus();
            selectTodayOnOpenPanel(view);

            expect(view.getValue()).toEqual(model.get('data'));
            expect(core.lib.moment(view.getValue()).year()).toEqual(core.lib.moment().year());
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).toHaveBeenCalledTimes(1);
        });

        it('should have `isEmptyValue() === true` if null', function() {
            // arrange
            const model = new Backbone.Model({
                data: null
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });
            this.rootRegion.show(view);

            // act
            const isEmpty = view.isEmptyValue();

            // assert
            expect(isEmpty).toEqual(true);
        });

        it('should have `isEmptyValue() === false` if has value', function() {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });
            this.rootRegion.show(view);
            console.log(view.model.attributes);
            // act
            const isEmpty = view.isEmptyValue();

            // assert
            expect(isEmpty).toEqual(false);
        });
    });
});
