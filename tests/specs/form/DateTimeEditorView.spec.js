import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('DateTimeEditorView', () => {
        const findDateInput = function (view) {
            return view.$(view.$('input')[0]);
        };

        const findTimeInput = function (view) {
            return view.$(view.$('input')[1]);
        };

        const selectTodayOnOpenPanel = function (view) {
            view.calendarDropdownView.panelView.$('.today:visible').click();
        };

        it('should get focus when focus() is called', () => {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.focus();

            expect(findDateInput(view)).toBeFocused();
            expect(view.calendarDropdownView.isOpen).toEqual(true, 'Must open dropdown on focus.');
            expect(view.hasFocus()).toEqual(true, 'Must have focus.');
        });

        it('should lose focus when blur() is called', () => {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.focus();

            view.blur();

            expect(findDateInput(view)).toBeFocused(); // Closing dropdown doesn't clear activeDocument to keep dropdown nesting
            expect(view.calendarDropdownView.isOpen).toEqual(false, "Dropdown mustn't be open.");
            //expect(view.hasFocus()).toEqual(false, "Mustn't have focus.");
        });

        it('should have `value` matched with initial value', () => {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
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
            expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            // expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(findTimeInput(view).val().replace(new RegExp('\\s+', 'g'), '')).toEqual(core.lib.moment(expected).format('HH:mm:ss'));
            expect(value).toEqual(expected);
        });

        it('should have `value` matched with initial value (w/o data binding).', () => {
            // arrange
            const expected = '2015-07-20T10:46:37.000Z';
            const view = new core.form.editors.DateTimeEditor({
                value: expected
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            // act
            const value = view.getValue();

            // assert
            expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            // expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(findTimeInput(view).val().replace(new RegExp('\\s+', 'g'), '')).toEqual(core.lib.moment(expected).format('HH:mm:ss'));
            expect(value).toEqual(expected);
        });

        it('should update `value` and send `change` on user change.', () => {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data',
                autocommit: true
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            // act
            view.focus();

            selectTodayOnOpenPanel(view);

            // assert
            expect(view.getValue()).toEqual(model.get('data'));
            expect(core.lib.moment(view.getValue()).year()).toEqual(core.lib.moment().year());
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should update `value` and send `change` on user change (w/o data binding).', () => {
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const expected = '2015-07-20T10:46:37.000Z';
            const view = new core.form.editors.DateTimeEditor({
                value: expected,
                autocommit: true
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            // act
            view.focus();
            selectTodayOnOpenPanel(view);
            const value = view.getValue();
            // assert
            /* todo fix it
            expect(value).not.toEqual(expected);
            expect(core.lib.moment(value).year()).toEqual(core.lib.moment().year());
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            */
        });

        it('should update `value` on model change', () => {
            const onChangeCallback = jasmine.createSpy('onChangeCallback');
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data',
                autocommit: true
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.on('change', onChangeCallback);

            model.set('data', '2016-01-01T00:00:06.000Z');
            const value = view.getValue();

            const expected = model.get('data');
            //expect(findDateInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayDate(core.lib.moment(expected)));
            //expect(findTimeInput(view).val()).toEqual(core.utils.dateHelpers.getDisplayTime(core.lib.moment(expected)));
            expect(value).toEqual(expected);
            expect(onChangeCallback).not.toHaveBeenCalled();
        });

        it('should not commit if `autocommit: false`', () => {
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
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
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

        it('should commit if `autocommit: true`', () => {
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

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.on('change', onChangeCallback);
            view.on('value:committed', onCommitCallback);

            view.focus();

            selectTodayOnOpenPanel(view);

            expect(view.getValue()).toEqual(model.get('data'));
            expect(core.lib.moment(view.getValue()).year()).toEqual(core.lib.moment().year());
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onCommitCallback).toHaveBeenCalledTimes(1);
        });

        it('should have `isEmptyValue() === true` if null', () => {
            // arrange
            const model = new Backbone.Model({
                data: null
            });
            const view = new core.form.editors.DateTimeEditor({
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

        it('should have `isEmptyValue() === false` if has value', () => {
            // arrange
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
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

        it('should open time editor if input clicked', () => {
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });

            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data'
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            findTimeInput(view)[0].click();

            expect(view.timeDropdownView.isOpen).toEqual(true);
        });

        it('should set time on time select', done => {
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });

            const view = new core.form.editors.DateTimeEditor({
                model,
                autocommit: true,
                key: 'data'
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.on('change', () => {
                expect(view.getValue()).toEqual('2015-07-19T22:00:00.000Z');
                done();
            });

            findTimeInput(view)[0].click();

            document.getElementsByClassName('time-dropdown__i')[4].click(); // '01:00' clicked

            expect(findTimeInput(view).val().replace(new RegExp('\\s+', 'g'), '')).toEqual(core.lib.moment('01:00', 'HH:mm').format('HH:mm:ss'));
        });
    });
});
