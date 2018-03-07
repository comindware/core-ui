// @flow
import template from './templates/simpleNumberEditor.html';
import formRepository from '../formRepository';
import NumberEditorView from '../editors/NumberEditorView';

formRepository.editors.SimpleNumberEditorView = NumberEditorView.extend({
    className: 'field-number',
    template: Handlebars.compile(template)
});

export default formRepository.editors.SimpleNumberEditorView;
