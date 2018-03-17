// @flow
import template from './templates/timeNumberEditor.html';
import formRepository from '../formRepository';
import NumberEditorView from '../editors/NumberEditorView';

export default formRepository.editors.TimeNumberEditorView = NumberEditorView.extend({
    className: 'field-time',

    template: Handlebars.compile(template)
});
