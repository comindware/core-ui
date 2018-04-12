import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Editors', () => {
    beforeEach(function () {
        this.rootRegion = initializeCore();
    });

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

            this.rootRegion.show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
