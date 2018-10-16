import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('RadioGroupEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    radioValue: 'value2'
                });
    
                return new core.form.editors.RadioGroupEditor({
                    model,
                    key: 'radioValue',
                    changeMode: 'keydown',
                    autocommit: true,
                    radioOptions: [{ id: 'value1', displayText: 'Some Text 1' }, { id: 'value2', displayText: 'Some Text 2' }, { id: 'value3', displayText: 'Some Text 3' }]
                });
            }
        });

        it('should initialize', () => {
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
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(true).toBe(true);
        });
    });
});
