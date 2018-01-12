/*eslint-ignore*/

import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';
/*eslint-ignore*/
describe('Editors', function() {
    beforeEach(function () {
        this.rootRegion = initializeCore();
    });

    describe('DurationEditor', function() {
        it('should get focus when focus() is called', function() {
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
            this.rootRegion.show(view);

            // act
            view.focus();

            // assert
            expect(findInput(view)).toBeFocused();
            expect(view.hasFocus).toEqual(true, 'Must have focus.');
        });

        it('should lose focus when blur() is called', function() {
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
            this.rootRegion.show(view);
            view.focus();

            // act
            view.blur();

            // assert
            expect(findInput(view)).not.toBeFocused();
            expect(view.hasFocus).toEqual(false, 'Mustn\'t have focus.');
        });

        it('should have `value` matched with initial value', function() {
            // arrange
            const model = new Backbone.Model({
                value: 'P3DT3H4M'
            });
            const view = new core.form.editors.DurationEditor({
                model,
                key: 'value'
            });
            this.rootRegion.show(view);

            // act
            const value = view.getValue();

            // assert
            const expected = model.get('value');
            expect(value).toEqual(expected);
        });
    });
});
