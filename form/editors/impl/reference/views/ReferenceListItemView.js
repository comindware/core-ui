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

define([
        'core/libApi',
        'core/list/listApi',
        'text!../templates/referenceListItem.html'
    ],
    function (
        lib,
        list,
        template
    ) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
            },

            behaviors: {
                ListItemViewBehavior: {
                    behaviorClass: list.views.behaviors.ListItemViewBehavior
                }
            },

            className: 'dd-list__i',

            template: Handlebars.compile(template),

            templateHelpers: function () {
                return {
                    text: this.model.get('text') || '#' + this.model.id
                };
            },

            events: {
                'click': '__select'
            },

            __select: function () {
                this.reqres.request('value:set', this.model);
            }
        });
    });
