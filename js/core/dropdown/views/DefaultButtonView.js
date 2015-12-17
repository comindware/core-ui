/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/defaultButton.html', 'core/libApi'],
    function (template) {
        'use strict';

        /**
         * @name DefaultButtonView
         * @memberof module:core.dropdown.views
         * @class Тривиальная реализация button View. Отображает свойство <code>text</code> передаваемой ей модели.
         * Используется в качестве buttonView в фабричном методе {@link module:core.dropdown.factory createMenu}.
         * @constructor
         * @extends Marionette.ItemView
         * @param {Object} options Объект опций.
         * @param {Backbone.Model} options.model Модель данных. Должна содержать атрибут <code>text</code>.
         * */

        return Marionette.ItemView.extend({
            initialize: function (options) {
            },

            tagName: 'span',

            template: Handlebars.compile(template),

            modelEvents: {
                'change': 'render'
            }
        });
    });
