import core from 'coreApi';
import 'jasmine-jquery';
/*eslint-ignore*/
describe('Editors', () => {
    describe('DurationEditor', () => {
        it('should get focus when focus() is called', () => {
            const findInput = function(view) {
                return view.$('input');
            };
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
            view.focus();

            // assert
            //expect(findInput(view)).toBeFocused();
            expect(view.hasFocus).toEqual(true, 'Must have focus.');
        });

        it('should lose focus when blur() is called', () => {
            const findInput = function(view) {
                return view.$('input');
            };
            // arrange
            const model = new Backbone.Model({
                data: 'text'
            });
            const view = new core.form.editors.DurationEditor({
                model,
                key: 'data'
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            view.focus();

            // act
            view.blur();

            // assert
            expect(findInput(view)).not.toBeFocused();
            expect(view.hasFocus).toEqual(false, "Mustn't have focus.");
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
    });
});
