/**
 * Developer: Krasnovskiy Denis
 * Date: 08/27/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['text!./templates/passwordEditor.html', './TextEditorView'],
    function (template, TextEditorView) {
        'use strict';

        /**
         * Some description for initializer
         * @name PasswordEditorView
         * @memberof module:core.form.editors
         * @class PasswordEditorView
         * @description Password editor
         * @extends module:core.form.editors.base.BaseItemEditorView {@link module:core.form.editors.base.BaseItemEditorView}
         * @param {Object} options Constructor
         * @param {Object} [options.schema] Scheme
         * @param {Boolean} [options.enabled=true] Доступ к редактору разрешен
         * @param {Boolean} [options.forceCommit=false] Обновлять значение независимо от ошибок валидации
         * @param {Boolean} [options.readonly=false] Редактор доступен только для просмотра
         * @param {Function[]} [options.validators] Массив функций валидации
         * */
        Backbone.Form.editors.Password = TextEditorView.extend({
            template: Handlebars.compile(template)
        });

        return Backbone.Form.editors.Password;
    });
