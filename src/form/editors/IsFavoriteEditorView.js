// @flow
import template from './templates/isFavoriteEditor.html';
import formRepository from '../formRepository';
import BooleanEditor from '../editors/BooleanEditorView';

const config: { template: Function } = {
    template: Handlebars.compile(template)
};

export default formRepository.editors.IsFavourite = BooleanEditor.extend(config);
