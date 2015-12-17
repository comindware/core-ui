/**
 * Developer: Stepan Burguchev
 * Date: 7/17/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Marionette, Handlebars, Backbone */

define(['text!core/list/templates/emptyList.html', 'core/libApi', 'core/services/LocalizationService'],
    function (template, lib, LocalizationService) {
        'use strict';

        var defaultText = LocalizationService.get("CORE.GRID.EMPTYVIEW.EMPTY");

        /**
         * Some description for initializer
         * @name EmptyListView
         * @memberof module:core.list.views
         * @class EmptyListView
         * @constructor
         * @description View используемый по умолчанию для отображения пустого списка (нет строк), передавать в {@link module:core.list.views.GridView GridView options.emptyView}
         * @extends Marionette.ItemView
         * @param {Object} options Constructor options
         * @param {string} [options.text=Список пуст] отображаемый текст
         * */
        var EmptyListView = Marionette.ItemView.extend({
            initialize: function (options) {
                this.model = new Backbone.Model({
                    text: (options && options.text) || defaultText
                });
            },

            template: Handlebars.compile(template),

            className: 'empty-view'

        });

        return EmptyListView;
    });
