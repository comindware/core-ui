/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['core/libApi'],
    function () {
        'use strict';

        /**
         * @name ListPanelView
         * @memberof module:core.dropdown.views
         * @class Базовая панель для отображения списка элементов. Может использоваться в panelView опции.
         * @constructor
         * @extends Marionette.CollectionView
         * @param {Object} options Объект опций.
         * */
        return Marionette.CollectionView.extend({
            initialize: function (options) {
            },

            tagName: 'ul'
        });
    });

