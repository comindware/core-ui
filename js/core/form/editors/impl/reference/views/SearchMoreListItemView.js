/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/searchMoreListItem.html', 'core/libApi'],
    function (template, lib) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
            },

            className: 'dev-reference-editor__dropdown-view__search-more-list-item-view',

            template: Handlebars.compile(template),

            events: {
                'click': '__searchMore'
            },

            __searchMore: function () {
                this.reqres.request('search:more');
            }
        });
    });
