import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

/*eslint-ignore*/
describe('Editors', () => {
    describe('DurationEditor', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    value: 'P3DT3H4M'
                });
                return new core.form.editors.DurationEditor({
                    model,
                    key: 'value'
                });
            },
            focusElement: '.js-input'
        });

        it('should have `value` matched with initial value', () => {
            // arrange
            const model = new Backbone.Model({
                value: 'P3DT3H4M'
            });
            const view = new core.form.editors.DurationEditor({
                model,
                key: 'value'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            // act
            const value = view.getValue();

            // assert
            const expected = model.get('value');
            expect(value).toEqual(expected);
        });

        it('should hide clear button if hideClearButton = true', () => {
            const model = new Backbone.Model({
                data: 'P3DT3H4M'
            });
            const view = new core.form.editors.DurationEditor({
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

        it('should set max value if value over max when blur() is called', () => {
            const max = 'P12DT18H4M';
            const overMaxInput = '15 d 18 h 4 m 0 s';
            const model = new Backbone.Model({
                data: 'P3DT3H4M'
            });
            const view = new core.form.editors.DurationEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                max
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const input = view.$('input');

            input.focus()
                .val(overMaxInput)
                .blur();

            const editorValue = view.getValue();
            const modelValue = model.get('data');

            expect(editorValue).toEqual(max);
            expect(modelValue).toEqual(max);
        });

        it('should set min value if value less min when blur() is called', () => {
            const min = 3600000; //1 hour
            const minISO = 'PT1H';
            const secondISO = 'PT1S';
            const secondInput = '0 d 0 h 0 m 1 s';
            const model = new Backbone.Model({
                data: 'P3DT3H4M'
            });
            const view = new core.form.editors.DurationEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true,
                min
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const input = view.$('input');

            input.focus()
                .val(secondInput)
                .blur();

            const editorValue = view.getValue();
            const modelValue = model.get('data');

            expect(editorValue).toEqual(minISO);
            expect(modelValue).toEqual(minISO);
        });

        it('should set null to model if editor value = "0 d 0 h 0 m 0 s"', () => {
            const nullInput = '0 d 0 h 0 m 0 s';
            const model = new Backbone.Model({
                data: 'P3DT3H4M'
            });
            const view = new core.form.editors.DurationEditor({
                model,
                key: 'data',
                changeMode: 'keydown',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const input = view.$('input');

            input.focus()
                .val(nullInput)
                .blur();

            let editorValue = view.getValue();
            let modelValue = model.get('data');
            expect(editorValue).toEqual(null);
            expect(modelValue).toEqual(null);
        });
    });
});
