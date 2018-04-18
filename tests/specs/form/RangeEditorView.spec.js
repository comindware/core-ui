import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('RangeEditorView', () => {
        it('should initialize', function () {
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

            window.application.contentRegion.show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
