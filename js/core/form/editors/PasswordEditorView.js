/**
 * Developer: Krasnovskiy Denis
 * Date: 08/27/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import TextEditorView from './TextEditorView';
import template from './templates/passwordEditor.hbs';

/**
 * @name PasswordEditorView
 * @memberof module:core.form.editors
 * @class Текстовый редактор для ввода пароля. Поддерживаемый тип данных: <code>String</code>.
 * @extends module:core.form.editors.TextEditorView
 * @param {Object} options Объект опций. Собственных опций нет. Поддерживаются все опции базового класса
 * {@link module:core.form.editors.TextEditorView TextEditorView}.
 * */
Backbone.Form.editors.Password = TextEditorView.extend(/** @lends module:core.form.editors.PasswordEditorView.prototype */{
    template: template
});

export default Backbone.Form.editors.Password;
