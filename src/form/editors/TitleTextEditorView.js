// @flow
import template from './templates/titleTextEditor.html';
import formRepository from '../formRepository';
import TextEditorView from '../editors/TextEditorView';

formRepository.editors.TitleText = TextEditorView.extend({
    className: 'editor',
    template: Handlebars.compile(template)
});

export default formRepository.editors.TitleText;
