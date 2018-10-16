/*eslint-ignore*/
import core from 'coreApi';
import OntologyService from '../../utils/OntologyService';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('CodeEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    value: null
                });
    
                return new core.form.editors.CodeEditor({
                    model,
                    key: 'value',
                    autocommit: true,
                    ontologyService: OntologyService
                });
            },
            focusElement: 'textarea'
        });

        it('should initialize', () => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.CodeEditor({
                model,
                key: 'value',
                autocommit: true,
                ontologyService: OntologyService
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
