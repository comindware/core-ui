import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('RadioGroupEditorView', () => {
        it('should initialize', function() {
            const model = new Backbone.Model({
                radioValue: 'value2'
            });

            const view = new core.form.editors.RadioGroupEditor({
                model,
                key: 'radioValue',
                changeMode: 'keydown',
                autocommit: true,
                radioOptions: [{ id: 'value1', displayText: 'Some Text 1' }, { id: 'value2', displayText: 'Some Text 2' }, { id: 'value3', displayText: 'Some Text 3' }]
            });
            window.application.contentRegion.show(view);

            expect(true).toBe(true);
        });
    });
});
