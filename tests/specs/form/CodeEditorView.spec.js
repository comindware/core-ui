/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('CodeEditorView', () => {
        it('should initialize', () => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.CodeEditor({
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
    });
});
