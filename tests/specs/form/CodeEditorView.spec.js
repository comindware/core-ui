/*eslint-ignore*/
import core from 'coreApi';
import OntologyService from '../../utils/OntologyService';
import FocusTests from './FocusTests';

const getCodeEditorView = function() {
    const model = new Backbone.Model({
        value: null
    });
    const codeEditorView = new core.form.editors.CodeEditor({
        model,
        key: 'value',
        autocommit: true,
        ontologyService: OntologyService
    });
    return codeEditorView;
};

const shwowView = function(view) {
    window.app
        .getView()
        .getRegion('contentRegion')
        .show(view);
};

describe('Editors', () => {
    describe('CodeEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => getCodeEditorView(),
            focusElement: 'textarea'
        });

        it('should initialize', () => {
            const codeEditorView = getCodeEditorView();
            shwowView(codeEditorView);
            // assert
            expect(true).toBe(true);
        });

        xit('The script should not  lose characters after adding to the editor - (mode LF and CR_LF)', () => {
            const textLF = '"using System;\nusing System.Collections.Generic;\nusing System.Linq;\nusing Comindware.Data.Enti';
            const textCR_LF = 'test_line_one;\r\ntest_line_two;\r\ntest_line_three;\r\n';

            const countLineSeparatorIn = 3;
            const lineCount = 4;

            const codeEditorView = getCodeEditorView();
            shwowView(codeEditorView);

            //test LF
            //set false options
            codeEditorView.editor.setOption('lineSeparator', '\r\n');
            codeEditorView.setValue(textLF);

            const valueCodeEditor = codeEditorView.getValue();
            let arrayEndLineChOut = valueCodeEditor.match(/;/g);
            let countOutChars = arrayEndLineChOut ? arrayEndLineChOut.length : 0;

            let lineCountEditor = codeEditorView.editor.codemirror.lineCount();

            expect(countLineSeparatorIn).toEqual(countOutChars);
            expect(lineCount).toEqual(lineCountEditor);

            //test CR_LF
            //set false options
            codeEditorView.editor.setOption('lineSeparator', '\n');
            codeEditorView.setValue(textCR_LF);

            arrayEndLineChOut = codeEditorView.getValue().match(/;/g);
            countOutChars = arrayEndLineChOut ? arrayEndLineChOut.length : 0;

            lineCountEditor = codeEditorView.editor.codemirror.lineCount();

            expect(countLineSeparatorIn).toEqual(countOutChars);
            expect(lineCount).toEqual(lineCountEditor);
        });
    });
});
