import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('RangeEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    value: '5'
                });
    
                return new core.form.editors.RangeEditor({
                    model,
                    key: 'value',
                    autocommit: true,
                    min: 1,
                    max: 10,
                    step: 1
                });
            }
        });

        it('should initialize', () => {
            const model = new Backbone.Model({
                value: '5'
            });

            const view = new core.form.editors.RangeEditor({
                model,
                key: 'value',
                autocommit: true,
                min: 1,
                max: 10,
                step: 1
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
