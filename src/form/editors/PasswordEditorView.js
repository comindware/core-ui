// @flow
import TextEditorView from './TextEditorView';
import template from './templates/passwordEditor.hbs';
import formRepository from '../formRepository';

/**
 * @name PasswordEditorView
 * @memberof module:core.form.editors
 * @class Текстовый редактор для ввода пароля. Поддерживаемый тип данных: <code>String</code>.
 * @extends module:core.form.editors.TextEditorView
 * @param {Object} options Options object. Doesn't have it's own options.
 * All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * */
export default (formRepository.editors.Password = TextEditorView.extend({
    initialize(options) {
        TextEditorView.prototype.initialize.call(this, options);
        this.options.showTitle = false;
        this.options.autocomplete = options.isAutocompleteEnabled ? 'on' : 'new-password';
    },

    template: Handlebars.compile(template)
}));
