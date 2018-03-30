// @flow
import template from './templates/timeNumberEditor.html';
import formRepository from '../formRepository';
import NumberEditorView from '../editors/NumberEditorView';

const config: { className: string, template: Function } = {
    className: 'field-time',

    template: Handlebars.compile(template)
};

export default formRepository.editors.TimeNumberEditorView = NumberEditorView.extend(config);
