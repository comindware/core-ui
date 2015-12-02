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

define(['module/lib'],
    function () {
        'use strict';

        /**
         * Some description for initializer
         * @name ListPanelView
         * @memberof module:core.dropdown.views
         * @class ListPanelView
         * @constructor
         * @description ListPanel
         * @extends Marionette.CollectionView
         * @param {Object} options Constructor options
         * */
        return Marionette.CollectionView.extend({
            initialize: function (options) {
            },

            tagName: 'ul'
        });
    });

