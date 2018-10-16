import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('ColorPickerEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    value: null
                });
    
                return new core.form.editors.ColorPickerEditor({
                    model,
                    key: 'value',
                    autocommit: true
                });
            },
            focusElement: '.hexcolor'
        });

        it('should initialize', () => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.ColorPickerEditor({
                model,
                key: 'value',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            // assert
            expect(true).toBe(true);
        });

        it('should initialize with correct value', () => {
            const model = new Backbone.Model({
                value: '#7f4e4e'
            });

            const view = new core.form.editors.ColorPickerEditor({
                model,
                key: 'value',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(view.getValue()).toEqual('#7f4e4e');
        });

        it('should clear value on remove button press', () => {
            const model = new Backbone.Model({
                value: '#7f4e4e'
            });

            const view = new core.form.editors.ColorPickerEditor({
                model,
                key: 'value',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.$('.input').trigger('mouseenter');

            document.getElementsByClassName('js-clear-button')[0].click();

            expect(view.getValue()).toEqual(null);
        });
    });
});
