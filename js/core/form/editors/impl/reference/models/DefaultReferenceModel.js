/**
 * Developer: Stepan Burguchev
 * Date: 12/12/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Backbone, Marionette, $, _ */

define([
        'core/list/listApi'
    ],
    function (
        list
    ) {
        'use strict';

        return Backbone.AssociatedModel.extend({
            initialize: function (data) {

                _.extend(this, new list.models.behaviors.ListItemBehavior(this));

                // because of two class 'Reference' on server
                if (data.name) {
                    this.set('text', data.name);
                } else {
                    this.set('name', data.text);
                }
            }
        });
    });
