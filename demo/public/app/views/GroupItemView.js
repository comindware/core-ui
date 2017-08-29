/**
 * Developer: Alexander Makarov
 * Date: 08.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'comindware/core',
    'text!../templates/groupItem.html'
],
(core, template) => {
    'use strict';

    const classes = {
        selected: 'selected'
    };

    return Marionette.ItemView.extend({

        template: Handlebars.compile(template),

        tagName: 'li',

        onRender() {
            this.$el.toggleClass(classes.selected, !!this.model.selected);
        },

        className: 'demo-groups__li'
    });
});
