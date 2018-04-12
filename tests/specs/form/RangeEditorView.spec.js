import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Editors', () => {
    beforeEach(function () {
        this.rootRegion = initializeCore();
    });

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

            this.rootRegion.show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
