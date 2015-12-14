/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
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

