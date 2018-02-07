
import template from './templates/isFavoriteEditor.html';
import formRepository from '../formRepository';
import BooleanEditor from '../editors/BooleanEditorView';

formRepository.editors.IsFavourite = BooleanEditor.extend({
    template: Handlebars.compile(template)
});

export default formRepository.editors.IsFavourite;
