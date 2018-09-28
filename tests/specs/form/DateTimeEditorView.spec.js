import core from 'coreApi';
import 'jasmine-jquery';
import DateTimeService from '../../../src/form/editors/services/DateTimeService';

const someDate = moment('1986-09-04T17:30:00.000Z');
const formatLocalisePrefix = 'CORE.FORMATS.MOMENT';

const formats = [
    {
        id: 'ShortDate',
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.SHORTDATE`),
        timeDisplayFormat: null,
        text: someDate.format(Localizer.get(`${formatLocalisePrefix}.SHORTDATE`))
    },
    {
        id: 'LongDate',
        timeDisplayFormat: null,
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.LONGDATE`),
        text: someDate.format(Localizer.get(`${formatLocalisePrefix}.LONGDATE`))
    },
    {
        id: 'ShortTime',
        dateDisplayFormat: null,
        timeDisplayFormat: Localizer.get(`${formatLocalisePrefix}.SHORTTIME`),
        text: someDate.format(Localizer.get(`${formatLocalisePrefix}.SHORTTIME`))
    },
    {
        id: 'LONG_TIME',
        dateDisplayFormat: null,
        timeDisplayFormat: Localizer.get(`${formatLocalisePrefix}.LONGTIME`),
        text: someDate.format(Localizer.get(`${formatLocalisePrefix}.LONGTIME`))
    },
    {
        id: 'LongDateShortTime',
        timeDisplayFormat: Localizer.get(`${formatLocalisePrefix}.SHORTTIME`),
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.LONGDATE`),
        text: `${someDate.format(Localizer.get(`${formatLocalisePrefix}.LONGDATE`))} ${someDate.format(Localizer.get(`${formatLocalisePrefix}.SHORTTIME`))}`
    },
    {
        id: 'LONG_DATE_LONG_TIME',
        timeDisplayFormat: Localizer.get(`${formatLocalisePrefix}.LONGTIME`),
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.LONGDATE`),
        text: `${someDate.format(Localizer.get(`${formatLocalisePrefix}.LONGDATE`))} ${someDate.format(Localizer.get(`${formatLocalisePrefix}.LONGTIME`))}`
    },
    {
        id: 'SHORT_DATE_SHORT_TIME',
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.SHORTDATE`),
        timeDisplayFormat: Localizer.get(`${formatLocalisePrefix}.SHORTTIME`),
        text: `${someDate.format(Localizer.get(`${formatLocalisePrefix}.SHORTDATE`))} ${someDate.format(Localizer.get(`${formatLocalisePrefix}.SHORTTIME`))}`
    },
    {
        id: 'SHORT_DATE_LONG_TIME',
        timeDisplayFormat: Localizer.get(`${formatLocalisePrefix}.LONGTIME`),
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.SHORTDATE`),
        text: `${someDate.format(Localizer.get(`${formatLocalisePrefix}.SHORTDATE`))} ${someDate.format(Localizer.get(`${formatLocalisePrefix}.LONGTIME`))}`
    },
    {
        id: 'CONDENSED_DATE_SHORT_TIME',
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.CONDENSEDDATE`),
        timeDisplayFormat: Localizer.get(`${formatLocalisePrefix}.SHORTTIME`),
        text: `${someDate.format(Localizer.get(`${formatLocalisePrefix}.CONDENSEDDATE`))} ${someDate.format(Localizer.get(`${formatLocalisePrefix}.SHORTTIME`))}`
    },
    {
        id: 'CONDENSED_DATE',
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.CONDENSEDDATE`),
        timeDisplayFormat: null,
        text: someDate.format(Localizer.get(`${formatLocalisePrefix}.CONDENSEDDATE`)),
        isDefault: true
    },
    {
        id: 'MONTH_DAY',
        timeDisplayFormat: null,
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.MONTHDAY`),
        text: someDate.format(Localizer.get(`${formatLocalisePrefix}.MONTHDAY`))
    },
    {
        id: 'YEAR_MONTH',
        timeDisplayFormat: null,
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.YEARMONTH`),
        text: someDate.format(Localizer.get(`${formatLocalisePrefix}.YEARMONTH`))
    },
    {
        id: 'DATE_ISO',
        timeDisplayFormat: null,
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.DATEISO`),
        text: someDate.format(Localizer.get(`${formatLocalisePrefix}.DATEISO`))
    },
    {
        id: 'DATE_TIME_ISO',
        timeDisplayFormat: Localizer.get(`${formatLocalisePrefix}.LONGTIME`),
        dateDisplayFormat: Localizer.get(`${formatLocalisePrefix}.DATEISO`),
        text: someDate.format()
    }
];

describe('Editors', () => {
    describe('DateTimeEditorView', () => {
        const findDateInput = function (view) {
            return view.$('input:first');
        };

        const findTimeInput = function (view) {
            return view.$('input:last');
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
                key: 'data',
                timeDisplayFormat: 'HH:mm:ss'
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
                value: expected,
                timeDisplayFormat: 'HH:mm:ss'
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
                key: 'data',
                timeDisplayFormat: 'HH:mm:ss'
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

                
        it('should hide clear button if hideClearButton = true', () => {
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateTimeEditor({
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

        
        it('should have no title options.showTitle false', () => {
            const dateTimeISO = '2015-07-20T10:46:37.000Z';
            const model = new Backbone.Model({
                data: dateTimeISO
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                showTitle: false
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(view.$el.prop('title')).toEqual('');
            expect(findDateInput(view).prop('title')).toEqual('');
            expect(findTimeInput(view).prop('title')).toEqual('');
        });

        it('should have title options.showTitle true', () => {
            const dateTimeISO = '2015-07-20T10:46:37.000Z';
            const model = new Backbone.Model({
                data: dateTimeISO
            });
            const view = new core.form.editors.DateTimeEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                showTitle: true,
                formats
            });

            const getDateDisplayValue = format => DateTimeService.getDateDisplayValue(dateTimeISO, format);
            const getTimeDisplayValue = format => DateTimeService.getTimeDisplayValue(dateTimeISO, format);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            formats.forEach(format => {
                view.setFormat(format);
                const resultValue = `${getDateDisplayValue(format.dateDisplayFormat)} ${getTimeDisplayValue(format.timeDisplayFormat)}`;
                expect(view.$el.prop('title')).toEqual(resultValue);
                expect(findDateInput(view).prop('title')).toEqual('');
                expect(findTimeInput(view).prop('title')).toEqual('');
            });
        });
    });
});
