/*eslint-ignore*/

import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Editors', () => {
    beforeEach(function () {
        this.rootRegion = initializeCore();
    });

    describe('CodeEditorView', () => {
        it('should initialize', function () {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.CodeEditor({
                model,
                key: 'value',
                autocommit: true
            });

            this.rootRegion.show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
