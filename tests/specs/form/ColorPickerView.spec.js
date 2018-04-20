import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('ColorPickerEditorView', () => {
        it('should initialize', function () {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.ColorPickerEditor({
                model,
                key: 'value',
                autocommit: true
            });

            window.app.getView().getRegion('contentRegion').show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
