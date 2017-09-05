/**
 * Developer: Krasnovskiy Denis
 * Date: 08/27/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import TextEditorView from './TextEditorView';
import { Handlebars } from 'lib';
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
formRepository.editors.Password = TextEditorView.extend(/** @lends module:core.form.editors.PasswordEditorView.prototype */{
    template: Handlebars.compile(template)
});

export default formRepository.editors.Password;
