// @flow
import template from './templates/titleTextEditor.html';
import formRepository from '../formRepository';
import TextEditorView from '../editors/TextEditorView';

const config: { className: string, template: Function } = {
    className: 'editor',

    template: Handlebars.compile(template)
};

export default formRepository.editors.TitleText = TextEditorView.extend(config);
