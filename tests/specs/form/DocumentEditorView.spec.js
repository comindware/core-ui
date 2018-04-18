import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('DocumentEditorView', () => {
        it('should initialize', function() {
            const model = new Backbone.Model({
                code: 'true'
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'code',
                autocommit: true,
                mode: 'code'
            });

            window.application.contentRegion.show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
