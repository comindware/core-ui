/**
 * Developer: Stepan Burguchev
 * Date: 7/17/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, Handlebars, Backbone */

define(['text!core/list/templates/emptyList.html', 'module/lib', 'core/services/LocalizationService'],
    function (template, lib, LocalizationService) {
        'use strict';

        var defaultText = LocalizationService.get("CORE.GRID.EMPTYVIEW.EMPTY");

        /**
         * Some description for initializer
         * @name EmptyListView
         * @memberof module:core.list.views
         * @class EmptyListView
         * @constructor
         * @description используемый по умолчанию для отображения пустого списка (нет строк), передавать в {@link module:core.list.views.GridView GridView options.emptyView}
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
