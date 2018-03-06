import template from './templates/booleanSwitchEditor.hbs';
import formRepository from '../formRepository';
import BooleanEditorView from '../editors/BooleanEditorView';

formRepository.editors.BooleanSwitch = BooleanEditorView.extend({
    template: Handlebars.compile(template),

    className: 'boolean-switch-editor__view'
});

export default formRepository.editors.BooleanSwitch;
